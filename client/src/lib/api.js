const API = "/api";

export async function fetchLeaderboard(group) {
  const res = await fetch(`${API}/leaderboard?group=${group}`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function fetchPlayers(grade, cls) {
  const params = new URLSearchParams();
  if (grade) params.set("grade", grade);
  if (cls) params.set("class", cls);
  const res = await fetch(`${API}/players?${params}`);
  if (!res.ok) throw new Error("Failed to fetch players");
  return res.json();
}

export async function fetchAllPlayers() {
  const res = await fetch(`${API}/players`);
  if (!res.ok) throw new Error("Failed to fetch players");
  return res.json();
}

export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API}/players/upload-csv`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function saveScore(playerId, completionRate, maxCombo, perfectCount) {
  const res = await fetch(`${API}/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      player_id: playerId,
      completion_rate: completionRate,
      max_combo: maxCombo,
      perfect_count: perfectCount,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "儲存失敗");
  return data;
}

export async function fetchScore(playerId) {
  const res = await fetch(`${API}/scores/${playerId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchBestScore(playerId) {
  const res = await fetch(`${API}/scores/${playerId}/best`);
  if (!res.ok) return null;
  return res.json();
}

export async function adminLogin(password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return res.json();
}

export async function adminLogout() {
  await fetch(`${API}/auth/logout`, { method: "POST" });
}

export function downloadPlayersCsv() {
  window.open(`${API}/players/export-csv`, "_blank");
}

export async function checkAuth() {
  const res = await fetch(`${API}/auth/check`);
  return res.json();
}

export async function analyzeScoreImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${API}/analyze-score-image`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "分析失敗");
  return data;
}

export async function deleteAllScores() {
  const res = await fetch(`${API}/scores/all`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "刪除失敗");
  return data;
}

export async function deleteAllPlayers() {
  const res = await fetch(`${API}/players/all`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "刪除失敗");
  return data;
}

export async function deletePlayer(id) {
  const res = await fetch(`${API}/players/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "刪除失敗");
  return data;
}

export async function deleteScore(id) {
  const res = await fetch(`${API}/scores/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "刪除失敗");
  return data;
}

export async function updatePlayer(id, data) {
  const res = await fetch(`${API}/players/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const resp = await res.json();
  if (!res.ok) throw new Error(resp.error || "更新失敗");
  return resp;
}

export async function updateScoreRecord(id, data) {
  const res = await fetch(`${API}/scores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const resp = await res.json();
  if (!res.ok) throw new Error(resp.error || "更新失敗");
  return resp;
}

export async function fetchAllScores() {
  const res = await fetch(`${API}/scores/all`);
  if (!res.ok) throw new Error("Failed to fetch scores");
  return res.json();
}
