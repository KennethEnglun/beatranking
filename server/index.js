import express from "express";
import session from "express-session";
import multer from "multer";
import csv from "csv-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createXai } from "@ai-sdk/xai";
import { generateObject } from "ai";
import { z } from "zod";
import {
  getLeaderboard,
  getAllPlayers,
  getPlayersByGradeAndClass,
  getPlayersByGrade,
  insertScore,
  updateScore,
  getBestScore,
  getAllScores,
  deletePlayer,
  deleteScore,
  deleteAllScores,
  deleteAllPlayers,
  updatePlayer,
  bulkInsertPlayers,
} from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const xai = createXai({ apiKey: process.env.XAI_API_KEY });

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

app.get("/api/scores/all", requireAdmin, (req, res) => {
  res.json(getAllScores());
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

const ScoreSchema = z.object({
  completion_rate: z.number().nullable().describe("完成率%，0-100數字"),
  max_combo: z.number().nullable().describe("最大連擊數"),
  perfect_count: z.number().nullable().describe("Perfect數量"),
});

app.post("/api/analyze-score-image", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "沒有上傳圖片" });
    const imageBuffer = fs.readFileSync(req.file.path);
    fs.unlinkSync(req.file.path);
    const { object } = await generateObject({
      model: xai("grok-4.3"),
      schema: ScoreSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "分析這張遊戲截圖，提取三項數據：完成率%(completion_rate, 0-100數字)、最大連擊(max_combo, 數字)、Perfect數量(perfect_count, 數字)。無法辨識的值設為 null。" },
            { type: "image", image: imageBuffer },
          ],
        },
      ],
    });
    res.json({
      completion_rate: object.completion_rate,
      max_combo: object.max_combo,
      perfect_count: object.perfect_count,
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
  const payload = [header, ...rows].join("\n") + "\n";
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=players.csv");
  res.send("\uFEFF" + payload);
});

app.delete("/api/players/all", requireAdmin, (req, res) => {
  deleteAllPlayers.run();
  res.json({ success: true });
});

app.delete("/api/players/:id", requireAdmin, (req, res) => {
  deletePlayer.run(parseInt(req.params.id));
  res.json({ success: true });
});

app.delete("/api/scores/all", requireAdmin, (req, res) => {
  deleteAllScores.run();
  res.json({ success: true });
});

app.delete("/api/scores/:id", requireAdmin, (req, res) => {
  deleteScore.run(parseInt(req.params.id));
  res.json({ success: true });
});

app.put("/api/players/:id", requireAdmin, (req, res) => {
  const { grade, class: cls, student_number, name } = req.body;
  if (!grade || !cls || !student_number || !name) {
    return res.status(400).json({ error: "所有欄位皆為必填" });
  }
  try {
    updatePlayer.run({
      id: parseInt(req.params.id),
      grade: parseInt(grade),
      class: cls,
      student_number,
      name,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "更新失敗：" + err.message });
  }
});

app.put("/api/scores/:id", requireAdmin, (req, res) => {
  const { completion_rate, max_combo, perfect_count } = req.body;
  try {
    updateScore.run({
      id: parseInt(req.params.id),
      completion_rate: parseFloat(completion_rate) || 0,
      max_combo: parseInt(max_combo) || 0,
      perfect_count: parseInt(perfect_count) || 0,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "更新失敗：" + err.message });
  }
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
