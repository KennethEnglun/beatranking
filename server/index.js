const express = require("express");
const session = require("express-session");
const multer = require("multer");
const csv = require("csv-parser");
const path = require("path");
const fs = require("fs");
const {
  getLeaderboard,
  getAllPlayers,
  getPlayersByGradeAndClass,
  getPlayersByGrade,
  insertScore,
  getBestScore,
  deletePlayer,
  bulkInsertPlayers,
} = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const upload = multer({ dest: path.join(__dirname, "uploads") });

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "beatranking-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 8 * 60 * 60 * 1000 },
  })
);

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: "未登入或登入已過期，請重新登入" });
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", db: "connected" });
});

app.post("/api/auth/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }
  res.status(401).json({ error: "密碼錯誤" });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get("/api/auth/check", (req, res) => {
  res.json({ authenticated: !!req.session.isAdmin });
});

app.get("/api/leaderboard", (req, res) => {
  const { group } = req.query;
  if (!["low", "mid", "high"].includes(group)) {
    return res.status(400).json({ error: "群組無效。請使用 low, mid 或 high。" });
  }
  res.json(getLeaderboard(group));
});

app.get("/api/players", (req, res) => {
  const { grade, class: cls } = req.query;
  if (grade && cls) {
    res.json(getPlayersByGradeAndClass.all(parseInt(grade), cls));
  } else if (grade) {
    res.json(getPlayersByGrade.all(parseInt(grade)));
  } else {
    res.json(getAllPlayers.all());
  }
});

app.post("/api/players/upload-csv", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "沒有上傳檔案" });

  const players = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      const keys = Object.keys(row);
      const getVal = (key) => {
        const exact = row[key];
        if (exact !== undefined) return exact;
        const bomKey = keys.find((k) => k.replace(/^\uFEFF/, "") === key);
        return bomKey ? row[bomKey] : undefined;
      };

      const grade = getVal("年級") || getVal("grade");
      const cls = getVal("班別") || getVal("class");
      const sn = getVal("學號") || getVal("student_number");
      const name = getVal("姓名") || getVal("name");
      if (grade && cls && sn && name) {
        players.push({
          grade: parseInt(grade),
          class: cls.trim(),
          student_number: sn.trim(),
          name: name.trim(),
        });
      }
    })
    .on("end", () => {
      const result = bulkInsertPlayers(players);
      fs.unlinkSync(req.file.path);
      if (result.total === 0) {
        return res.json({ success: false, error: "CSV 中沒有可識別的玩家資料，請檢查欄位名稱" });
      }
      res.json({ success: true, total: result.total, processed: result.processed });
    })
    .on("error", (err) => {
      res.status(500).json({ error: err.message });
    });
});

app.get("/api/scores/:playerId", (req, res) => {
  const score = getBestScore(parseInt(req.params.playerId));
  res.json(score || null);
});

app.get("/api/scores/:playerId/best", (req, res) => {
  const score = getBestScore(parseInt(req.params.playerId));
  res.json(score || null);
});

app.post("/api/scores", requireAdmin, handleSaveScore);
app.put("/api/scores", requireAdmin, handleSaveScore);

const VISION_API_KEY = process.env.VISION_API_KEY || "";
const VISION_MODEL = process.env.VISION_MODEL || "z-ai/vision-v2";

app.post("/api/analyze-score-image", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "沒有上傳圖片" });

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64 = imageBuffer.toString("base64");
    const mimeType = req.file.mimetype || "image/png";
    fs.unlinkSync(req.file.path);

    const visionResp = await fetch("https://opencode.ai/zen/go/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${VISION_API_KEY}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "請分析這張遊戲截圖，提取以下三項數據，嚴格以 JSON 格式回覆，不要任何其他文字：\n{\"completion_rate\": 數字(0-100), \"max_combo\": 數字, \"perfect_count\": 數字}\n無法辨識的值設為 null。",
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
            ],
          },
        ],
        max_tokens: 200,
      }),
    });

    if (!visionResp.ok) {
      const errText = await visionResp.text();
      console.error("AI API 錯誤:", errText);
      return res.status(502).json({ error: "AI 服務暫時不可用，請重試" });
    }

    const visionData = await visionResp.json();
    const reply = visionData.choices?.[0]?.message?.content || "";

    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(422).json({ error: "AI 無法從圖片中辨識分數，請確認截圖清晰" });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({
      completion_rate: parsed.completion_rate ?? null,
      max_combo: parsed.max_combo ?? null,
      perfect_count: parsed.perfect_count ?? null,
    });
  } catch (err) {
    console.error("圖片分析錯誤:", err.message);
    res.status(500).json({ error: "分析失敗：" + err.message });
  }
});

function handleSaveScore(req, res) {
  try {
    const { player_id, completion_rate, max_combo, perfect_count } = req.body;
    if (!player_id) return res.status(400).json({ error: "player_id 為必填項" });

    insertScore.run({
      player_id: parseInt(player_id),
      completion_rate: parseFloat(completion_rate) || 0,
      max_combo: parseInt(max_combo) || 0,
      perfect_count: parseInt(perfect_count) || 0,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("儲存分數錯誤:", err.message);
    res.status(500).json({ error: "伺服器錯誤：" + err.message });
  }
}

app.get("/api/players/export-csv", requireAdmin, (req, res) => {
  const players = getAllPlayers.all();
  const header = "年級,班別,學號,姓名";
  const rows = players.map((p) => `${p.grade},${p.class},${p.student_number},${p.name}`);
  const csv = [header, ...rows].join("\n") + "\n";
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=players.csv");
  res.send("\uFEFF" + csv);
});

app.delete("/api/players/:id", requireAdmin, (req, res) => {
  deletePlayer.run(parseInt(req.params.id));
  res.json({ success: true });
});

const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error("未捕獲錯誤:", err.message);
  res.status(500).json({ error: "伺服器錯誤：" + err.message });
});

app.listen(PORT, () => {
  console.log(`伺服器運行於 port ${PORT}`);
});
