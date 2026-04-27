{\rtf1\ansi\ansicpg936\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // ==================== \uc0\u29366 \u24577  ====================\
let currentLevel = 'zero';\
let currentContent = null;\
let isPlaying = false;\
let answersVisible = false;\
let toastTimer = null;\
let isLoading = false; // \uc0\u21152 \u36733 \u29366 \u24577 \
\
// ==================== DOM \uc0\u20803 \u32032  ====================\
const difficultyGrid = document.getElementById('difficultyGrid');\
const diffButtons = difficultyGrid.querySelectorAll('.diff-btn');\
const btnGenerate = document.getElementById('btnGenerate');\
const contentCard = document.getElementById('contentCard');\
const audioSection = document.getElementById('audioSection');\
const btnPlay = document.getElementById('btnPlay');\
const audioStatus = document.getElementById('audioStatus');\
const exercisesContainer = document.getElementById('exercisesContainer');\
const answerSection = document.getElementById('answerSection');\
const btnAnswer = document.getElementById('btnAnswer');\
const answersPanel = document.getElementById('answersPanel');\
const btnMiniPlay = document.getElementById('btnMiniPlay');\
const inputDictation = document.getElementById('inputDictation');\
const inputFill = document.getElementById('inputFill');\
const inputTranslate = document.getElementById('inputTranslate');\
const choiceOptions = document.getElementById('choiceOptions');\
const fillSentenceDisplay = document.getElementById('fillSentenceDisplay');\
const translatePrompt = document.getElementById('translatePrompt');\
const toast = document.getElementById('toast');\
\
// ==================== Toast ====================\
function showToast(msg) \{\
    if (toastTimer) clearTimeout(toastTimer);\
    toast.textContent = msg;\
    toast.classList.add('show');\
    toastTimer = setTimeout(() => \{\
        toast.classList.remove('show');\
    \}, 2200);\
\}\
\
// ==================== API \uc0\u35843 \u29992  ====================\
async function fetchAIcontent(level) \{\
    // \uc0\u35774 \u32622 \u21152 \u36733 \u29366 \u24577 \
    isLoading = true;\
    btnGenerate.disabled = true;\
    btnGenerate.innerHTML = '<span class="sparkle">\uc0\u9203 </span> AI\u29983 \u25104 \u20013 ...';\
\
    try \{\
        const response = await fetch('/api/generate', \{\
            method: 'POST',\
            headers: \{ 'Content-Type': 'application/json' \},\
            body: JSON.stringify(\{ level \})\
        \});\
\
        if (!response.ok) \{\
            throw new Error(`\uc0\u26381 \u21153 \u22120 \u38169 \u35823 : $\{response.status\}`);\
        \}\
\
        const data = await response.json();\
        return data;\
    \} catch (error) \{\
        console.error('\uc0\u33719 \u21462 AI\u20869 \u23481 \u22833 \u36133 :', error);\
        showToast('\uc0\u9888 \u65039  \u29983 \u25104 \u22833 \u36133 \u65292 \u35831 \u26816 \u26597 \u21518 \u31471 \u26381 \u21153 \u26159 \u21542 \u21551 \u21160 ');\
        return null;\
    \} finally \{\
        isLoading = false;\
        btnGenerate.disabled = false;\
        btnGenerate.innerHTML = '<span class="sparkle">\uc0\u10024 </span> \u29983 \u25104 \u20170 \u26085 \u38889 \u35821 \u38899 \u39057 ';\
    \}\
\}\
\
// ==================== \uc0\u28210 \u26579 \u23398 \u20064 \u20869 \u23481  ====================\
function renderContent(content) \{\
    if (!content) return;\
\
    const vocabHTML = content.vocabulary.map(v =>\
        `<span class="vocab-chip">$\{v.word\} <span class="vocab-meaning">$\{v.meaning\}</span></span>`\
    ).join('');\
\
    contentCard.classList.remove('empty-state');\
    contentCard.innerHTML = `\
        <h3>\uc0\u55357 \u56534  \u23398 \u20064 \u20869 \u23481 </h3>\
        <div class="korean-text">$\{content.korean\}</div>\
        <div class="chinese-text">\uc0\u55357 \u56492  $\{content.chinese\}</div>\
        <div class="info-row">\
            <span class="info-tag"><span class="tag-icon">\uc0\u55357 \u56541 </span> \u20851 \u38190 \u35789 \u27719 </span>\
        </div>\
        <div class="vocab-list">$\{vocabHTML\}</div>\
        <div style="margin-top:14px;">\
            <span class="info-tag"><span class="tag-icon">\uc0\u55357 \u56803 \u65039 </span> \u21457 \u38899 \u25552 \u31034 </span>\
        </div>\
        <div class="pronunciation-tip" style="margin-top:6px;">$\{content.pronunciation.replace(/\\n/g, '<br>')\}</div>\
    `;\
\
    audioSection.style.display = 'flex';\
    audioStatus.textContent = '';\
    btnPlay.classList.remove('playing');\
    isPlaying = false;\
\}\
\
// ==================== \uc0\u28210 \u26579 \u20316 \u19994  ====================\
function renderExercises(content) \{\
    if (!content) return;\
\
    // \uc0\u21548 \u20889 \u39064 \
    inputDictation.value = '';\
\
    // \uc0\u36873 \u25321 \u39064  - \u30452 \u25509 \u20351 \u29992 AI\u29983 \u25104 \u30340 \u36873 \u39033 \
    choiceOptions.innerHTML = content.choiceOptions.map(opt => `\
        <label class="ex-option" data-correct="$\{opt.isCorrect\}">\
            <span class="opt-letter">$\{opt.letter\}</span>\
            <span>$\{opt.text\}</span>\
        </label>\
    `).join('');\
\
    // \uc0\u22635 \u31354 \u39064 \
    fillSentenceDisplay.textContent = content.fillBlank.sentence;\
    inputFill.value = '';\
\
    // \uc0\u32763 \u35793 \u39064 \
    translatePrompt.textContent = content.chinese;\
    inputTranslate.value = '';\
\
    exercisesContainer.style.display = 'block';\
    answerSection.style.display = 'block';\
    answersPanel.classList.remove('visible');\
    answersVisible = false;\
    btnAnswer.textContent = '\uc0\u55357 \u56589  \u26597 \u30475 \u31572 \u26696 ';\
    btnAnswer.classList.remove('showing');\
\}\
\
// ==================== \uc0\u28210 \u26579 \u31572 \u26696  ====================\
function renderAnswers(content) \{\
    if (!content) return;\
    const correctOption = content.choiceOptions.find(o => o.isCorrect);\
\
    answersPanel.innerHTML = `\
        <div class="answer-item">\
            <span class="answer-label">\uc0\u55356 \u57255  \u21548 \u20889 \u39064 \u31572 \u26696 </span>\
            <div class="answer-value">$\{content.korean\}</div>\
        </div>\
        <div class="answer-item">\
            <span class="answer-label">\uc0\u9989  \u36873 \u25321 \u39064 \u31572 \u26696 </span>\
            <div class="answer-value zh">\uc0\u27491 \u30830 \u31572 \u26696 \u65306 $\{correctOption ? correctOption.letter : ''\}. $\{content.chinese\}</div>\
        </div>\
        <div class="answer-item">\
            <span class="answer-label">\uc0\u9999 \u65039  \u22635 \u31354 \u39064 \u31572 \u26696 </span>\
            <div class="answer-value">$\{content.fillBlank.answer\}</div>\
            <div style="font-family:var(--font-korean);color:var(--text);margin-top:2px;">\uc0\u23436 \u25972 \u21477 \u23376 \u65306 $\{content.korean\}</div>\
        </div>\
        <div class="answer-item">\
            <span class="answer-label">\uc0\u55356 \u57104  \u32763 \u35793 \u39064 \u31572 \u26696 </span>\
            <div class="answer-value">$\{content.korean\}</div>\
        </div>\
    `;\
\}\
\
// ==================== \uc0\u35821 \u38899 \u21512 \u25104  ====================\
function getKoreanVoice() \{\
    const voices = speechSynthesis.getVoices();\
    let koreanVoice = voices.find(v => v.lang === 'ko-KR' && v.localService);\
    if (!koreanVoice) koreanVoice = voices.find(v => v.lang === 'ko-KR');\
    if (!koreanVoice) koreanVoice = voices.find(v => v.lang.startsWith('ko'));\
    return koreanVoice || null;\
\}\
\
function speakKorean(text, onStart, onEnd) \{\
    speechSynthesis.cancel();\
    const utterance = new SpeechSynthesisUtterance(text);\
    utterance.lang = 'ko-KR';\
    utterance.rate = 0.85;\
    utterance.pitch = 1.0;\
    utterance.volume = 1.0;\
    const koreanVoice = getKoreanVoice();\
    if (koreanVoice) utterance.voice = koreanVoice;\
\
    utterance.onstart = () => \{ if (onStart) onStart(); \};\
    utterance.onend = () => \{ if (onEnd) onEnd(); \};\
    utterance.onerror = (e) => \{\
        console.warn('\uc0\u35821 \u38899 \u21512 \u25104 \u38169 \u35823 :', e);\
        if (onEnd) onEnd();\
        if (e.error !== 'canceled' && e.error !== 'interrupted') \{\
            showToast('\uc0\u9888 \u65039  \u35821 \u38899 \u25773 \u25918 \u22833 \u36133 \u65292 \u35831 \u26816 \u26597 \u27983 \u35272 \u22120 \u26159 \u21542 \u25903 \u25345 \u38889 \u35821 \u35821 \u38899 ');\
        \}\
    \};\
    speechSynthesis.speak(utterance);\
\}\
\
function handlePlayAudio() \{\
    if (!currentContent) \{\
        showToast('\uc0\u35831 \u20808 \u29983 \u25104 \u23398 \u20064 \u20869 \u23481 ');\
        return;\
    \}\
    if (isPlaying) \{\
        speechSynthesis.cancel();\
        isPlaying = false;\
        btnPlay.classList.remove('playing');\
        btnPlay.querySelector('.play-icon').textContent = '\uc0\u55357 \u56586 ';\
        audioStatus.textContent = '\uc0\u24050 \u20572 \u27490 ';\
        return;\
    \}\
    speakKorean(\
        currentContent.korean,\
        () => \{\
            isPlaying = true;\
            btnPlay.classList.add('playing');\
            btnPlay.querySelector('.play-icon').textContent = '\uc0\u9208 \u65039 ';\
            audioStatus.textContent = '\uc0\u27491 \u22312 \u25773 \u25918 ...';\
        \},\
        () => \{\
            isPlaying = false;\
            btnPlay.classList.remove('playing');\
            btnPlay.querySelector('.play-icon').textContent = '\uc0\u55357 \u56586 ';\
            audioStatus.textContent = '\uc0\u25773 \u25918 \u23436 \u27605  \u10003 ';\
            setTimeout(() => \{\
                if (audioStatus.textContent === '\uc0\u25773 \u25918 \u23436 \u27605  \u10003 ') audioStatus.textContent = '';\
            \}, 3000);\
        \}\
    );\
\}\
\
// ==================== \uc0\u20107 \u20214 \u30417 \u21548  ====================\
diffButtons.forEach(btn => \{\
    btn.addEventListener('click', () => \{\
        diffButtons.forEach(b => b.classList.remove('active'));\
        btn.classList.add('active');\
        currentLevel = btn.dataset.level;\
        showToast(`\uc0\u24050 \u36873 \u25321 \u65306 $\{btn.textContent.trim().split('\\n')[0]\}`);\
    \});\
\});\
\
btnGenerate.addEventListener('click', async () => \{\
    if (isLoading) return;\
    const content = await fetchAIcontent(currentLevel);\
    if (!content) return;\
    currentContent = content;\
    renderContent(content);\
    renderExercises(content);\
    renderAnswers(content);\
    contentCard.scrollIntoView(\{ behavior: 'smooth', block: 'start' \});\
    showToast('\uc0\u9989  AI\u23398 \u20064 \u20869 \u23481 \u24050 \u29983 \u25104 \u65281 ');\
\});\
\
btnPlay.addEventListener('click', handlePlayAudio);\
\
btnMiniPlay.addEventListener('click', () => \{\
    if (!currentContent) \{\
        showToast('\uc0\u35831 \u20808 \u29983 \u25104 \u23398 \u20064 \u20869 \u23481 ');\
        return;\
    \}\
    speechSynthesis.cancel();\
    if (isPlaying) \{\
        isPlaying = false;\
        btnPlay.classList.remove('playing');\
        btnPlay.querySelector('.play-icon').textContent = '\uc0\u55357 \u56586 ';\
        audioStatus.textContent = '';\
    \}\
    speakKorean(\
        currentContent.korean,\
        () => \{\
            btnMiniPlay.textContent = '\uc0\u9208 \u65039  \u27491 \u22312 \u25773 \u25918 ...';\
            btnMiniPlay.style.background = '#FFE4E0';\
        \},\
        () => \{\
            btnMiniPlay.textContent = '\uc0\u55357 \u56586  \u28857 \u20987 \u25773 \u25918 \u38899 \u39057 ';\
            btnMiniPlay.style.background = '#FFF0EE';\
        \}\
    );\
\});\
\
btnAnswer.addEventListener('click', () => \{\
    if (!currentContent) \{\
        showToast('\uc0\u35831 \u20808 \u29983 \u25104 \u23398 \u20064 \u20869 \u23481 ');\
        return;\
    \}\
    answersVisible = !answersVisible;\
    if (answersVisible) \{\
        answersPanel.classList.add('visible');\
        btnAnswer.textContent = '\uc0\u55357 \u56594  \u38544 \u34255 \u31572 \u26696 ';\
        btnAnswer.classList.add('showing');\
        answersPanel.scrollIntoView(\{ behavior: 'smooth', block: 'center' \});\
    \} else \{\
        answersPanel.classList.remove('visible');\
        btnAnswer.textContent = '\uc0\u55357 \u56589  \u26597 \u30475 \u31572 \u26696 ';\
        btnAnswer.classList.remove('showing');\
    \}\
\});\
\
// ==================== \uc0\u21021 \u22987 \u21270  ====================\
function init() \{\
    if ('speechSynthesis' in window) \{\
        speechSynthesis.getVoices();\
        speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();\
    \} else \{\
        showToast('\uc0\u9888 \u65039  \u24744 \u30340 \u27983 \u35272 \u22120 \u19981 \u25903 \u25345 \u35821 \u38899 \u21512 \u25104 ');\
    \}\
    console.log('\uc0\u55356 \u56816 \u55356 \u56823  \u38889 \u35821 \u38899 \u39057 \u23398 \u20064 \u21161 \u25163  (AI\u29256 ) \u24050 \u23601 \u32490 ');\
\}\
init();}