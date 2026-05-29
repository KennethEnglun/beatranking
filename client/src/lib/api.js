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
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      player_id: playerId,
      completion_rate: completionRate,
      max_combo: maxCombo,
      perfect_count: perfectCount,
    }),
  });
  return res.json();
}

export async function fetchScore(playerId) {
  const res = await fetch(`${API}/scores/${playerId}`);
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

export async function checkAuth() {
  const res = await fetch(`${API}/auth/check`);
  return res.json();
}
