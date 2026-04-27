import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  try {
    const { level } = req.body;

    let prompt = "";

    if (level === "beginner") {
      prompt = "请生成一段非常简单的韩语短文（TOPIK1水平），内容日常，长度3-5句。附中文翻译。";
    } else if (level === "intermediate") {
      prompt = "请生成一段中等难度韩语短文（TOPIK2水平），内容为对话或日常生活，长度5-8句。附中文翻译。";
    } else {
      prompt = "请生成一段较高级韩语短文（TOPIK3以上），内容有表达性或观点，长度8-12句。附中文翻译。";
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    res.json({
      text: data.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "生成失败" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});