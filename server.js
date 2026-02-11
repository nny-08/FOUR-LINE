const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());

const DATA_DIR = path.join(__dirname, "data");
const PRIZES_FILE = path.join(DATA_DIR, "prizes.json");
const CODES_FILE = path.join(DATA_DIR, "codes.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

// 初始化檔案
function initFile(file, defaultData) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
    }
}
initFile(PRIZES_FILE, { A: 3, B: 20, C: 35, D: 42 });
initFile(CODES_FILE, []);
initFile(HISTORY_FILE, []);

// 生成驗證碼
app.post("/generate-code", (req, res) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const codes = JSON.parse(fs.readFileSync(CODES_FILE));
    codes.push({ code, used: false, prizes: [] });
    fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2));
    res.json({ code });
});

// 驗證碼驗證
app.post("/verify-code", (req, res) => {
    const { code } = req.body;
    const codes = JSON.parse(fs.readFileSync(CODES_FILE));
    const entry = codes.find(c => c.code === code && !c.used);
    res.json({ success: !!entry });
});

// 抽獎
app.post("/draw", (req, res) => {
    const { code } = req.body;
    const prizes = JSON.parse(fs.readFileSync(PRIZES_FILE));
    const codes = JSON.parse(fs.readFileSync(CODES_FILE));
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE));

    const entry = codes.find(c => c.code === code);
    if (!entry) return res.json({ success: false, msg: "驗證碼無效" });

    let prizePool = [];
    Object.keys(prizes).forEach(p => {
        for (let i = 0; i < prizes[p]; i++) prizePool.push(p);
    });

    codes.forEach(c => c.prizes.forEach(p => {
        const idx = prizePool.indexOf(p);
        if (idx > -1) prizePool.splice(idx, 1);
    }));

    let weightedPool = [];
    prizePool.forEach(p => {
        if (p === "A" || p === "B") { if (Math.random() < 0.15) weightedPool.push(p); }
        else { if (Math.random() < 0.85) weightedPool.push(p); }
    });
    if (weightedPool.length === 0) weightedPool = prizePool;

    const prize = weightedPool[Math.floor(Math.random() * weightedPool.length)];

    entry.prizes.push(prize);
    history.push({ code, prize, time: new Date().toISOString() });

    fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2));
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

    const totalDraws = Object.values(prizes).reduce((a,b)=>a+b,0);
    const drawn = history.length;
    const remaining = totalDraws - drawn;

    res.json({ success: true, prize, drawn, remaining });
});

// 查抽獎歷史
app.get("/admin/history", (req, res) => {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE));
    res.json(history);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
