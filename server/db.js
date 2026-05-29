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
    player_id INTEGER UNIQUE NOT NULL,
    completion_rate REAL NOT NULL DEFAULT 0,
    max_combo INTEGER NOT NULL DEFAULT 0,
    perfect_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
  );
`);

const insertPlayer = db.prepare(`
  INSERT OR IGNORE INTO players (grade, class, student_number, name)
  VALUES (@grade, @class, @student_number, @name)
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

const upsertScore = db.prepare(`
  INSERT INTO scores (player_id, completion_rate, max_combo, perfect_count)
  VALUES (@player_id, @completion_rate, @max_combo, @perfect_count)
  ON CONFLICT(player_id) DO UPDATE SET
    completion_rate = @completion_rate,
    max_combo = @max_combo,
    perfect_count = @perfect_count,
    updated_at = datetime('now','localtime')
`);

const getScoreByPlayerId = db.prepare(`
  SELECT * FROM scores WHERE player_id = ?
`);

const deletePlayer = db.prepare(`DELETE FROM players WHERE id = ?`);

const countPlayers = db.prepare(`SELECT COUNT(*) as count FROM players`);

function buildLeaderboardQuery(group) {
  const gradeRanges = { low: [1, 2], mid: [3, 4], high: [5, 6] };
  const grades = gradeRanges[group];
  if (!grades) return [];

  return db
    .prepare(
      `SELECT p.id, p.grade, p.class, p.student_number, p.name,
              COALESCE(s.completion_rate, 0) AS completion_rate,
              COALESCE(s.max_combo, 0) AS max_combo,
              COALESCE(s.perfect_count, 0) AS perfect_count
       FROM players p
       LEFT JOIN scores s ON p.id = s.player_id
       WHERE p.grade IN (${grades.join(",")})
       ORDER BY completion_rate DESC, max_combo DESC, perfect_count DESC`
    )
    .all();
}

function getLeaderboard(group) {
  const rows = buildLeaderboardQuery(group);
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
    let count = 0;
    for (const p of list) {
      const result = insertPlayer.run({
        grade: parseInt(p.grade),
        class: p.class,
        student_number: p.student_number,
        name: p.name,
      });
      if (result.changes > 0) count++;
    }
    return count;
  });
  return tx(players);
}

module.exports = {
  getAllPlayers,
  getPlayersByGradeAndClass,
  getPlayersByGrade,
  upsertScore,
  getScoreByPlayerId,
  deletePlayer,
  countPlayers,
  getLeaderboard,
  bulkInsertPlayers,
};
