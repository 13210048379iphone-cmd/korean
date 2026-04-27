const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const port = 3000;

// 初始化 OpenAI 客户端，API Key 从环境变量读取
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"  // 指向阿里云
});
// 中间件
app.use(cors());                 // 允许跨域请求
app.use(express.json());        // 解析 JSON 请求体
app.use(express.static('public')); // 托管前端静态文件

// 等级对应的中文描述，用于生成更精准的 prompt
const levelDescriptions = {
    zero: '零基础，只会最简单的问候、数字、自我介绍。句子必须非常短，用最基础的词汇。',
    topik1: 'TOPIK 1 级，简单的日常生活话题，例如吃饭、问路、购物、时间。句子简短，语法简单。',
    topik2: 'TOPIK 2 级，稍长一些的日常对话，涉及学校、工作、计划、天气等。句子结构可稍复杂，但仍然是日常用语。',
    topik3: 'TOPIK 3 级，更接近真实韩国人的表达，可以包含原因、转折、建议、感受等。句子自然，适当使用连接词。'
};

// 生成韩语学习内容的 API
app.post('/api/generate', async (req, res) => {
    const { level } = req.body;

    if (!level || !levelDescriptions[level]) {
        return res.status(400).json({ error: '无效的等级参数' });
    }

    const description = levelDescriptions[level];

    // 精心设计的 prompt，要求 AI 返回指定 JSON 结构
    const prompt = `你是一位专业的韩语老师。请为一位中文母语者生成一条韩语学习内容，学生目前水平为：${description}

请严格按照以下 JSON 格式返回（只返回 JSON，不要包含任何其他文字）：

{
  "korean": "生动的韩语句子或短对话（适合该水平）",
  "chinese": "准确的中文翻译",
  "vocabulary": [
    { "word": "韩语单词", "meaning": "中文意思" },
    ...
  ],
  "pronunciation": "用中文标注的发音提示和罗马音，可以用换行符\\n隔开多条",
  "fillBlank": {
    "sentence": "将原句中的某一个关键词替换成'______'（四个下划线），作为填空题的题目",
    "answer": "被挖掉的那个词（韩语原词）"
  },
  "choiceOptions": [
    { "letter": "A", "text": "中文选项A（错误的）", "isCorrect": false },
    { "letter": "B", "text": "中文选项B（正确的）", "isCorrect": true },
    { "letter": "C", "text": "中文选项C（错误的）", "isCorrect": false },
    { "letter": "D", "text": "中文选项D（错误的）", "isCorrect": false }
  ]
}

注意事项：
- korean 字段必须是纯韩语，不要带罗马音或翻译。
- pronunciation 字段用中文详细说明发音要点，比如“안녕하세요 读作 an-nyeong-ha-se-yo，注意 하 发音轻柔”。
- fillBlank 中的 sentence 必须保留原有的韩语句子结构，只挖掉一个词，用______替换。
- choiceOptions 必须是四个选项，其中一个是正确的（isCorrect: true），其他是干扰项但看起来合理。
- 整个输出必须是合法的 JSON 对象。`;

    try {
        const completion = await openai.chat.completions.create({
    model: 'qwen-turbo',   // 这里改成阿里云的模型
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    response_format: { type: 'json_object' }
});
        const aiText = completion.choices[0].message.content;
        const content = JSON.parse(aiText);

        // 简单校验必要字段
        if (!content.korean || !content.chinese || !content.fillBlank || !content.choiceOptions) {
            throw new Error('AI 返回数据不完整');
        }

        res.json(content);
    } catch (error) {
        console.error('生成内容失败:', error);
        // 返回备用内容，防止前端空白
        res.json({
            korean: '안녕하세요!',
            chinese: '你好！',
            vocabulary: [{ word: '안녕하세요', meaning: '你好' }],
            pronunciation: 'an-nyeong-ha-se-yo\n注意：하 发音轻柔',
            fillBlank: { sentence: '______!', answer: '안녕하세요' },
            choiceOptions: [
                { letter: 'A', text: '谢谢', isCorrect: false },
                { letter: 'B', text: '你好', isCorrect: true },
                { letter: 'C', text: '再见', isCorrect: false },
                { letter: 'D', text: '对不起', isCorrect: false }
            ]
        });
    }
});

app.listen(port, () => {
    console.log(`✅ 韩语学习助手后端已启动：http://localhost:${port}`);
});