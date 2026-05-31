import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAllPlayers, fetchAllScores,
  deleteAllScores, deleteAllPlayers, deletePlayer, deleteScore,
  updatePlayer, updateScoreRecord,
} from "../lib/api";
import { useTheme } from "../lib/ThemeContext";

const GRADES = ["1", "2", "3", "4", "5", "6"];

export default function DataManager() {
  const { t, theme } = useTheme();
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // 編輯狀態
  const [editPlayerId, setEditPlayerId] = useState(null);
  const [editPlayerData, setEditPlayerData] = useState({});
  const [editScoreId, setEditScoreId] = useState(null);
  const [editScoreData, setEditScoreData] = useState({});

  // 雙重確認
  const [confirmLevel, setConfirmLevel] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([fetchAllPlayers(), fetchAllScores()]);
      setPlayers(p);
      setScores(s);
    } catch (e) {
      setMessage({ type: "error", text: "載入失敗" });
    } finally {
      setLoading(false);
    }
  }

  function showMsg(text, type = "success") {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 2500);
  }

  async function handleDeleteAllScores() {
    try { await deleteAllScores(); showMsg("已清除全部分數"); setScores([]); }
    catch { showMsg("清除失敗", "error"); }
    setConfirmLevel(null); setConfirmText("");
  }

  async function handleDeleteAllPlayers() {
    try { await deleteAllPlayers(); showMsg("已清除全體玩家及分數"); setPlayers([]); setScores([]); }
    catch { showMsg("清除失敗", "error"); }
    setConfirmLevel(null); setConfirmText("");
  }

  async function handleDeletePlayer(id) {
    try { await deletePlayer(id); showMsg("已刪除玩家"); loadAll(); }
    catch { showMsg("刪除失敗", "error"); }
  }

  async function handleDeleteScore(id) {
    try { await deleteScore(id); showMsg("已刪除分數記錄"); loadAll(); }
    catch { showMsg("刪除失敗", "error"); }
  }

  function startEditPlayer(p) {
    setEditPlayerId(p.id);
    setEditPlayerData({ grade: String(p.grade), class: p.class, student_number: p.student_number, name: p.name });
  }

  async function savePlayerEdit() {
    try {
      await updatePlayer(editPlayerId, editPlayerData);
      showMsg("玩家資料已更新");
      setEditPlayerId(null);
      loadAll();
    } catch (e) { showMsg(e.message || "更新失敗", "error"); }
  }

  function startEditScore(s) {
    setEditScoreId(s.id);
    setEditScoreData({ completion_rate: String(s.completion_rate), max_combo: String(s.max_combo), perfect_count: String(s.perfect_count) });
  }

  async function saveScoreEdit() {
    try {
      await updateScoreRecord(editScoreId, {
        completion_rate: parseFloat(editScoreData.completion_rate) || 0,
        max_combo: parseInt(editScoreData.max_combo) || 0,
        perfect_count: parseInt(editScoreData.perfect_count) || 0,
      });
      showMsg("分數已更新");
      setEditScoreId(null);
      loadAll();
    } catch (e) { showMsg(e.message || "更新失敗", "error"); }
  }

  const thStyle = { fontFamily: t.titleFont, color: t.muted, textAlign: "left", padding: "6px 8px", fontSize: "11px" };
  const tdStyle = { padding: "6px 8px", fontSize: "12px", color: t.text, borderBottom: `1px solid ${t.border}20` };
  const inputStyle = { background: t.inputBg, border: `1px solid ${t.primary}50`, color: t.text, borderRadius: t.borderRadius, padding: "4px 6px", fontSize: "11px", width: "100%", outline: "none" };

  if (loading) {
    return <div className="text-center py-8" style={{ color: t.muted }}>載入中...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-3 p-2 rounded text-center text-xs border"
            style={{
              fontFamily: t.titleFont, borderRadius: t.borderRadius,
              borderColor: message.type === "success" ? `${t.accent}50` : "rgba(255,50,50,0.5)",
              color: message.type === "success" ? t.accent : "#ff6666",
              background: message.type === "success" ? `${t.accent}08` : "rgba(255,0,0,0.05)",
            }}>
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚠️ 危險操作區 */}
      <div className="mb-6 p-4 rounded border" style={{ borderColor: `${t.secondary}40`, background: `${t.secondary}05`, borderRadius: t.borderRadius }}>
        <h4 className="text-xs mb-3" style={{ fontFamily: t.titleFont, color: t.secondary }}>⚠️ 危險操作</h4>

        {/* 刪除全體分數 */}
        {confirmLevel === "scores" ? (
          <div className="flex items-center gap-2 mb-2">
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder='輸入 "DELETE" 確認'
              className="flex-1 text-xs px-2 py-1 rounded"
              style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text, borderRadius: t.borderRadius, outline: "none" }}
              autoFocus
            />
            <button onClick={handleDeleteAllScores} disabled={confirmText !== "DELETE"}
              className="px-3 py-1 rounded text-xs border transition-colors"
              style={{
                background: confirmText === "DELETE" ? "#E3350D" : "transparent",
                color: confirmText === "DELETE" ? "#fff" : t.muted,
                borderColor: confirmText === "DELETE" ? "#E3350D" : t.border,
                borderRadius: t.borderRadius,
                cursor: confirmText === "DELETE" ? "pointer" : "not-allowed",
                opacity: confirmText === "DELETE" ? 1 : 0.5,
              }}>
              確認清除
            </button>
            <button onClick={() => { setConfirmLevel(null); setConfirmText(""); }}
              className="px-3 py-1 rounded text-xs border" style={{ borderColor: t.border, color: t.muted, borderRadius: t.borderRadius }}>
              取消
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmLevel("scores")}
            className="w-full mb-2 py-2 rounded text-xs border transition-colors"
            style={{ fontFamily: t.titleFont, borderColor: t.yellow, color: t.yellow, borderRadius: t.borderRadius, background: `${t.yellow}05` }}>
            🗑️ 刪除全體分數
          </button>
        )}

        {/* 刪除全體玩家 */}
        {confirmLevel === "players" ? (
          <div className="flex items-center gap-2">
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder='輸入 "DELETE" 確認'
              className="flex-1 text-xs px-2 py-1 rounded"
              style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text, borderRadius: t.borderRadius, outline: "none" }}
              autoFocus
            />
            <button onClick={handleDeleteAllPlayers} disabled={confirmText !== "DELETE"}
              className="px-3 py-1 rounded text-xs border transition-colors"
              style={{
                background: confirmText === "DELETE" ? "#E3350D" : "transparent",
                color: confirmText === "DELETE" ? "#fff" : t.muted,
                borderColor: confirmText === "DELETE" ? "#E3350D" : t.border,
                borderRadius: t.borderRadius,
                cursor: confirmText === "DELETE" ? "pointer" : "not-allowed",
                opacity: confirmText === "DELETE" ? 1 : 0.5,
              }}>
              確認清除
            </button>
            <button onClick={() => { setConfirmLevel(null); setConfirmText(""); }}
              className="px-3 py-1 rounded text-xs border" style={{ borderColor: t.border, color: t.muted, borderRadius: t.borderRadius }}>
              取消
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmLevel("players")}
            className="w-full py-2 rounded text-xs border transition-colors"
            style={{ fontFamily: t.titleFont, borderColor: t.secondary, color: t.secondary, borderRadius: t.borderRadius, background: `${t.secondary}05` }}>
            💀 刪除全體玩家（連分數一併清除）
          </button>
        )}
      </div>

      {/* 玩家列表 */}
      <h4 className="text-xs mb-2" style={{ fontFamily: t.titleFont, color: t.primary }}>👤 玩家列表 ({players.length})</h4>
      <div className="mb-6 max-h-64 overflow-y-auto rounded border" style={{ borderColor: t.border, borderRadius: t.borderRadius }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: t.bg }}>
              <th style={thStyle}>年級</th>
              <th style={thStyle}>班別</th>
              <th style={thStyle}>學號</th>
              <th style={thStyle}>姓名</th>
              <th style={{ ...thStyle, textAlign: "center", width: "80px" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <AnimatePresence key={p.id}>
                <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {editPlayerId === p.id ? (
                    <>
                      <td style={tdStyle}>
                        <select value={editPlayerData.grade} onChange={(e) => setEditPlayerData({ ...editPlayerData, grade: e.target.value })} style={inputStyle}>
                          {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </td>
                      <td style={tdStyle}><input value={editPlayerData.class} onChange={(e) => setEditPlayerData({ ...editPlayerData, class: e.target.value })} style={inputStyle} /></td>
                      <td style={tdStyle}><input value={editPlayerData.student_number} onChange={(e) => setEditPlayerData({ ...editPlayerData, student_number: e.target.value })} style={inputStyle} /></td>
                      <td style={tdStyle}><input value={editPlayerData.name} onChange={(e) => setEditPlayerData({ ...editPlayerData, name: e.target.value })} style={inputStyle} /></td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <div className="flex gap-1 justify-center">
                          <button onClick={savePlayerEdit} className="text-xs px-2 py-1 rounded" style={{ background: `${t.accent}20`, color: t.accent, borderRadius: t.borderRadius, fontFamily: t.titleFont }}>✓</button>
                          <button onClick={() => setEditPlayerId(null)} className="text-xs px-2 py-1 rounded" style={{ background: `${t.muted}20`, color: t.muted, borderRadius: t.borderRadius, fontFamily: t.titleFont }}>✕</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={tdStyle}>{p.grade}</td>
                      <td style={tdStyle}>{p.class}</td>
                      <td style={tdStyle}>{p.student_number}</td>
                      <td style={{ ...tdStyle, color: t.text }}>{p.name}</td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => startEditPlayer(p)} className="text-xs px-2 py-1 rounded hover:opacity-80" style={{ background: `${t.primary}15`, color: t.primary, borderRadius: t.borderRadius, fontFamily: t.titleFont }}>✏️</button>
                          <button onClick={() => handleDeletePlayer(p.id)} className="text-xs px-2 py-1 rounded hover:opacity-80" style={{ background: `${t.secondary}15`, color: t.secondary, borderRadius: t.borderRadius, fontFamily: t.titleFont }}>🗑️</button>
                        </div>
                      </td>
                    </>
                  )}
                </motion.tr>
              </AnimatePresence>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分數列表 */}
      <h4 className="text-xs mb-2" style={{ fontFamily: t.titleFont, color: t.accent }}>📊 分數記錄 ({scores.length})</h4>
      <div className="max-h-64 overflow-y-auto rounded border" style={{ borderColor: t.border, borderRadius: t.borderRadius }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: t.bg }}>
              <th style={thStyle}>玩家</th>
              <th style={thStyle}>完成率%</th>
              <th style={thStyle}>連擊</th>
              <th style={thStyle}>Perfect</th>
              <th style={thStyle}>時間</th>
              <th style={{ ...thStyle, textAlign: "center", width: "80px" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <AnimatePresence key={s.id}>
                <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {editScoreId === s.id ? (
                    <>
                      <td style={{ ...tdStyle, color: t.primary }}>
                        {s.name} ({s.grade}{s.class})
                      </td>
                      <td style={tdStyle}><input value={editScoreData.completion_rate} onChange={(e) => setEditScoreData({ ...editScoreData, completion_rate: e.target.value })} type="number" step="0.01" style={inputStyle} /></td>
                      <td style={tdStyle}><input value={editScoreData.max_combo} onChange={(e) => setEditScoreData({ ...editScoreData, max_combo: e.target.value })} type="number" style={inputStyle} /></td>
                      <td style={tdStyle}><input value={editScoreData.perfect_count} onChange={(e) => setEditScoreData({ ...editScoreData, perfect_count: e.target.value })} type="number" style={inputStyle} /></td>
                      <td style={tdStyle}>{s.created_at?.slice(0, 16)}</td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <div className="flex gap-1 justify-center">
                          <button onClick={saveScoreEdit} className="text-xs px-2 py-1 rounded" style={{ background: `${t.accent}20`, color: t.accent, borderRadius: t.borderRadius, fontFamily: t.titleFont }}>✓</button>
                          <button onClick={() => setEditScoreId(null)} className="text-xs px-2 py-1 rounded" style={{ background: `${t.muted}20`, color: t.muted, borderRadius: t.borderRadius, fontFamily: t.titleFont }}>✕</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ ...tdStyle, color: t.primary }}>{s.name} ({s.grade}{s.class})</td>
                      <td style={{ ...tdStyle, color: s.completion_rate >= 90 ? t.accent : t.text }}>{s.completion_rate}%</td>
                      <td style={tdStyle}>{s.max_combo}</td>
                      <td style={tdStyle}>{s.perfect_count}</td>
                      <td style={{ ...tdStyle, color: t.muted, fontSize: "10px" }}>{s.created_at?.slice(5, 16)}</td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => startEditScore(s)} className="text-xs px-2 py-1 rounded hover:opacity-80" style={{ background: `${t.primary}15`, color: t.primary, borderRadius: t.borderRadius, fontFamily: t.titleFont }}>✏️</button>
                          <button onClick={() => handleDeleteScore(s.id)} className="text-xs px-2 py-1 rounded hover:opacity-80" style={{ background: `${t.secondary}15`, color: t.secondary, borderRadius: t.borderRadius, fontFamily: t.titleFont }}>🗑️</button>
                        </div>
                      </td>
                    </>
                  )}
                </motion.tr>
              </AnimatePresence>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
