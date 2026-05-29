const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = process.env.DB_PATH || path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });
const DB_PATH = path.join(dataDir, "beatranking.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grade INTEGER NOT NULL CHECK(grade BETWEEN 1 AND 6),
    class TEXT NOT NULL,
    student_number TEXT NOT NULL,
    name TEXT NOT NULL,
    UNIQUE(grade, class, student_number)
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    completion_rate REAL NOT NULL DEFAULT 0,
    max_combo INTEGER NOT NULL DEFAULT 0,
    perfect_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
  );
`);

const hasUniqueIndex = db
  .prepare(`SELECT name FROM sqlite_master WHERE type='index' AND name LIKE '%player_id%' AND name LIKE '%scores%'`)
  .get();

if (hasUniqueIndex) {
  db.exec(`
    CREATE TABLE scores_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      completion_rate REAL NOT NULL DEFAULT 0,
      max_combo INTEGER NOT NULL DEFAULT 0,
      perfect_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    );
    INSERT INTO scores_new (id, player_id, completion_rate, max_combo, perfect_count, created_at)
      SELECT id, player_id, completion_rate, max_combo, perfect_count,
             COALESCE(created_at, datetime('now','localtime'))
      FROM scores;
    DROP TABLE scores;
    ALTER TABLE scores_new RENAME TO scores;
  `);
  console.log("已遷移 scores 表：移除 UNIQUE 約束，支援多重記錄");
}

const upsertPlayer = db.prepare(`
  INSERT INTO players (grade, class, student_number, name)
  VALUES (@grade, @class, @student_number, @name)
  ON CONFLICT(grade, class, student_number) DO UPDATE SET name = excluded.name
`);

const getAllPlayers = db.prepare(`
  SELECT * FROM players ORDER BY grade, class, student_number
`);

const getPlayersByGradeAndClass = db.prepare(`
  SELECT * FROM players WHERE grade = ? AND class = ? ORDER BY student_number
`);

const getPlayersByGrade = db.prepare(`
  SELECT * FROM players WHERE grade = ? ORDER BY class, student_number
`);

const insertScore = db.prepare(`
  INSERT INTO scores (player_id, completion_rate, max_combo, perfect_count)
  VALUES (@player_id, @completion_rate, @max_combo, @perfect_count)
`);

const deletePlayer = db.prepare(`DELETE FROM players WHERE id = ?`);

function getBestScore(playerId) {
  return db
    .prepare(
      `SELECT * FROM scores
       WHERE player_id = ?
       ORDER BY completion_rate DESC, max_combo DESC, perfect_count DESC
       LIMIT 1`
    )
    .get(playerId) || null;
}

function getLeaderboard(group) {
  const gradeRanges = { low: [1, 2], mid: [3, 4], high: [5, 6] };
  const grades = gradeRanges[group];
  if (!grades) return [];

  const rows = db
    .prepare(
      `SELECT p.id, p.grade, p.class, p.student_number, p.name,
              COALESCE(s.completion_rate, 0) AS completion_rate,
              COALESCE(s.max_combo, 0) AS max_combo,
              COALESCE(s.perfect_count, 0) AS perfect_count
       FROM players p
       LEFT JOIN scores s ON p.id = s.player_id
          AND s.id = (SELECT s2.id FROM scores s2
                      WHERE s2.player_id = p.id
                      ORDER BY s2.completion_rate DESC, s2.max_combo DESC, s2.perfect_count DESC
                      LIMIT 1)
       WHERE p.grade IN (${grades.join(",")})
       ORDER BY completion_rate DESC, max_combo DESC, perfect_count DESC`
    )
    .all();

  const ranked = [];
  let rank = 0;
  let prev = null;

  for (const row of rows) {
    if (
      !prev ||
      row.completion_rate !== prev.completion_rate ||
      row.max_combo !== prev.max_combo ||
      row.perfect_count !== prev.perfect_count
    ) {
      rank++;
    }
    ranked.push({ ...row, rank });
    prev = row;
  }
  return ranked;
}

function bulkInsertPlayers(players) {
  const tx = db.transaction((list) => {
    let processed = 0;
    for (const p of list) {
      upsertPlayer.run({
        grade: parseInt(p.grade),
        class: p.class,
        student_number: p.student_number,
        name: p.name,
      });
      processed++;
    }
    return { total: list.length, processed };
  });
  return tx(players);
}

module.exports = {
  getAllPlayers,
  getPlayersByGradeAndClass,
  getPlayersByGrade,
  insertScore,
  getBestScore,
  deletePlayer,
  getLeaderboard,
  bulkInsertPlayers,
};
