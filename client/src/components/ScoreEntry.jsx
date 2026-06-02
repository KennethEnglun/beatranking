import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllPlayers, fetchBestScore, saveScore, analyzeScoreImage } from "../lib/api";
import { useTheme } from "../lib/ThemeContext";
import ConfettiEffect from "./ConfettiEffect";

const GRADES = ["1", "2", "3", "4", "5", "6"];

const fadeIn = {
  hidden: { opacity: 0, y: 10, height: 0 },
  visible: { opacity: 1, y: 0, height: "auto", transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, height: 0, transition: { duration: 0.2 } },
};

const selectStyle = (t) => ({
  width: "100%",
  padding: "0.625rem 0.75rem",
  background: t.inputBg,
  border: `1px solid ${t.border}`,
  borderRadius: t.borderRadius,
  color: t.text,
  fontSize: "0.875rem",
  outline: "none",
  fontFamily: t.font,
  cursor: "pointer",
  appearance: "none",
  transition: "border-color 0.2s",
});

export default function ScoreEntry() {
  const { t, theme } = useTheme();
  const [allPlayers, setAllPlayers] = useState([]);
  const [grade, setGrade] = useState("");
  const [cls, setCls] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [completionRate, setCompletionRate] = useState("");
  const [maxCombo, setMaxCombo] = useState("");
  const [perfectCount, setPerfectCount] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [bestScore, setBestScore] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchAllPlayers().then(setAllPlayers).catch(() => {}); }, []);

  const filterBy = useCallback((players, exclude) => {
    return players.filter((p) => {
      if (exclude !== "grade" && grade && String(p.grade) !== grade) return false;
      if (exclude !== "cls" && cls && p.class !== cls) return false;
      if (exclude !== "studentNumber" && studentNumber && p.student_number !== studentNumber) return false;
      if (exclude !== "playerId" && playerId && String(p.id) !== playerId) return false;
      return true;
    });
  }, [grade, cls, studentNumber, playerId]);

  const available = useMemo(() => ({
    grades: [...new Set(filterBy(allPlayers, "grade").map((p) => String(p.grade)))].sort(),
    classes: [...new Set(filterBy(allPlayers, "cls").map((p) => p.class))].sort(),
    studentNumbers: [...new Set(filterBy(allPlayers, "studentNumber").map((p) => p.student_number))].sort(),
    names: filterBy(allPlayers, "playerId"),
  }), [allPlayers, filterBy]);

  const selectedPlayer = useMemo(() => {
    if (playerId) return allPlayers.find((p) => String(p.id) === playerId);
    if (grade && cls && studentNumber) return allPlayers.find((p) => String(p.grade) === grade && p.class === cls && p.student_number === studentNumber);
    return null;
  }, [playerId, grade, cls, studentNumber, allPlayers]);

  useEffect(() => {
    if (selectedPlayer) {
      setGrade(String(selectedPlayer.grade));
      setCls(selectedPlayer.class);
      setStudentNumber(selectedPlayer.student_number);
      setPlayerId(String(selectedPlayer.id));
      setBestScore(null);
      fetchBestScore(selectedPlayer.id).then(setBestScore);
    } else {
      setBestScore(null);
    }
  }, [selectedPlayer]);

  function clearPlayers() {
    setGrade(""); setCls(""); setStudentNumber(""); setPlayerId("");
    setCompletionRate(""); setMaxCombo(""); setPerfectCount("");
    setBestScore(null); setImageFile(null); setImagePreview(null); setAiResult(null);
  }

  function handleImageSelect(e) {
    const f = e.target.files?.[0]; if (!f) return;
    setImageFile(f); setImagePreview(URL.createObjectURL(f)); setAiResult(null);
  }

  async function handleAnalyze() {
    if (!imageFile) return;
    setAnalyzing(true); setAiResult(null); setMessage(null);
    try { const r = await analyzeScoreImage(imageFile); setAiResult(r); }
    catch (err) { setMessage({ type: "error", text: `❌ ${err.message || "分析失敗"}` }); }
    finally { setAnalyzing(false); }
  }

  function handleFillScores() {
    if (!aiResult) return;
    if (aiResult.completion_rate != null) setCompletionRate(String(aiResult.completion_rate));
    if (aiResult.max_combo != null) setMaxCombo(String(aiResult.max_combo));
    if (aiResult.perfect_count != null) setPerfectCount(String(aiResult.perfect_count));
    setMessage({ type: "success", text: "✅ 已填入 AI 分析結果，確認後按儲存" });
    setTimeout(() => setMessage(null), 2000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const targetId = selectedPlayer?.id; if (!targetId) return;
    setSaving(true); setMessage(null);
    try {
      await saveScore(targetId, parseFloat(completionRate) || 0, parseInt(maxCombo) || 0, parseInt(perfectCount) || 0);
      setMessage({ type: "success", text: `✅ ${selectedPlayer.name} 分數已儲存！` });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      clearPlayers();
    } catch (err) {
      setMessage({ type: "error", text: `❌ ${err.message || "儲存失敗，請重試"}` });
    } finally {
      setSaving(false); setTimeout(() => setMessage(null), 3000);
    }
  }

  const inputClass = "w-full px-3 py-2.5 rounded text-sm font-mono focus:outline-none transition-colors";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3 className="text-sm mb-4 text-center" style={{ fontFamily: t.titleFont, color: t.secondary }}>🎯 輸入玩家分數</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["年級", "班別", "學號", "姓名"].map((label, i) => (
          <div key={label}>
            <label className="block text-xs mb-1.5" style={{ color: t.muted }}>{label}</label>
            <select
              value={i === 0 ? grade : i === 1 ? cls : i === 2 ? studentNumber : playerId}
              onChange={(e) => {
                const v = e.target.value;
                if (i === 0) { setGrade(v); setPlayerId(""); }
                else if (i === 1) { setCls(v); setPlayerId(""); }
                else if (i === 2) { setStudentNumber(v); setPlayerId(""); }
                else {
                  setPlayerId(v);
                  if (v) { const p = allPlayers.find((p) => String(p.id) === v); if (p) { setGrade(String(p.grade)); setCls(p.class); setStudentNumber(p.student_number); } }
                }
              }}
              style={selectStyle(t)}
              onFocus={(e) => { e.target.style.borderColor = t.secondary; }}
              onBlur={(e) => { e.target.style.borderColor = t.border; }}
            >
              <option value="">所有{label}</option>
              {i === 0 ? GRADES.filter((g) => available.grades.length === 0 || available.grades.includes(g)).map((g) => <option key={g} value={g}>{g}年級</option>)
                : i === 1 ? available.classes.map((c) => <option key={c} value={c}>{c}班</option>)
                : i === 2 ? available.studentNumbers.map((sn) => <option key={sn} value={sn}>{sn}</option>)
                : available.names.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.grade}{p.class} {p.student_number})</option>)}
            </select>
          </div>
        ))}

        <AnimatePresence>
          {selectedPlayer ? (
            <motion.div key="player-form" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="pt-4 space-y-4" style={{ borderTop: `1px solid ${t.border}` }}>
              <div className="px-3 py-2 rounded text-center" style={{ background: `${t.primary}08`, borderColor: `${t.primary}30`, border: `1px solid ${t.primary}30` }}>
                <span className="text-sm font-bold" style={{ color: t.primary }}>
                  已選：{selectedPlayer.name}（{selectedPlayer.grade}{selectedPlayer.class} {selectedPlayer.student_number}）
                </span>
                <button type="button" onClick={clearPlayers} className="ml-3 text-xs hover:text-neon-magenta transition-colors" style={{ color: t.muted }}>✕ 清除</button>
              </div>

              <AnimatePresence>
                {bestScore && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="px-3 py-2 rounded text-xs" style={{ background: `${t.yellow}08`, borderColor: `${t.yellow}20`, border: `1px solid ${t.yellow}20`, color: t.muted }}>
                    <span style={{ color: t.yellow }}>最佳記錄參考：</span>
                    完成率 <span style={{ color: t.accent }}>{bestScore.completion_rate}%</span>
                    <span className="mx-1.5" style={{ color: t.muted }}>|</span>
                    最大連擊 <span style={{ color: t.secondary }}>{bestScore.max_combo}</span>
                    <span className="mx-1.5" style={{ color: t.muted }}>|</span>
                    Perfect <span style={{ color: t.primary }}>{bestScore.perfect_count}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="rounded p-3" style={{ border: `1px solid ${t.secondary}20`, background: `${t.secondary}05` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs" style={{ fontFamily: t.titleFont, color: t.secondary }}>🤖 AI 截圖分析</span>
                  <span className="text-[10px]" style={{ color: t.muted }}>上傳遊戲截圖，AI 自動辨識分數</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
                <div className="flex gap-2 mb-2">
                  {[{ label: "📷 拍照", ref: cameraInputRef, color: t.primary }, { label: "📁 上傳圖片", ref: fileInputRef, color: t.secondary }].map((btn) => (
                    <motion.button key={btn.label} type="button"
                      whileHover={{ scale: 1.03, boxShadow: `0 0 10px ${btn.color}20` }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => btn.ref.current?.click()}
                      className="flex-1 py-2 rounded text-[10px] border transition-colors"
                      style={{ fontFamily: t.titleFont, borderColor: btn.color + "50", color: btn.color, borderRadius: t.borderRadius }}>
                      {btn.label}
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence>
                  {imagePreview && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <img src={imagePreview} alt="" className="w-full rounded border mb-2 max-h-48 object-contain" style={{ borderColor: t.border }} />
                      {!aiResult && (
                        <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={handleAnalyze} disabled={analyzing}
                          className="w-full py-2 rounded text-[10px] border-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ fontFamily: t.titleFont, borderColor: t.yellow, color: t.yellow, borderRadius: t.borderRadius, background: `${t.yellow}08` }}>
                          {analyzing ? "分析中..." : "🤖 分析圖片"}
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {aiResult && (
                    <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }} className="overflow-hidden">
                      <div className="rounded p-2" style={{ background: `${t.bg}80`, border: `1px solid ${t.accent}30` }}>
                        <div className="text-xs mb-1" style={{ color: t.muted }}>AI 分析結果：</div>
                        <div className="flex gap-2 text-xs font-mono mb-2">
                          <motion.span initial={{ scale: 1.3 }} animate={{ scale: 1 }} style={{ color: t.accent }}>
                            {aiResult.completion_rate != null ? `${aiResult.completion_rate}%` : "—"}
                          </motion.span>
                          <span style={{ color: t.muted }}>|</span>
                          <motion.span initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ delay: 0.05 }} style={{ color: t.secondary }}>
                            連擊 {aiResult.max_combo != null ? aiResult.max_combo : "—"}
                          </motion.span>
                          <span style={{ color: t.muted }}>|</span>
                          <motion.span initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} style={{ color: t.primary }}>
                            Perfect {aiResult.perfect_count != null ? aiResult.perfect_count : "—"}
                          </motion.span>
                        </div>
                        <motion.button type="button" whileHover={{ scale: 1.03, boxShadow: `0 0 12px ${t.accent}30` }} whileTap={{ scale: 0.97 }}
                          onClick={handleFillScores}
                          className="w-full py-1.5 rounded text-[10px] border transition-colors"
                          style={{ fontFamily: t.titleFont, borderColor: t.accent, color: t.accent, borderRadius: t.borderRadius, background: `${t.accent}08` }}>
                          ✅ 填入分數欄位
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {[
                { label: "完成率 %", value: completionRate, set: setCompletionRate, suffix: "%", color: t.accent, placeholder: "0", max: "100", step: "0.01" },
                { label: "最大連擊", value: maxCombo, set: setMaxCombo, color: t.secondary, placeholder: "0", max: undefined },
                { label: "Perfect 數量", value: perfectCount, set: setPerfectCount, color: t.primary, placeholder: "0", max: undefined },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs mb-1.5" style={{ color: t.muted }}>{f.label}</label>
                  <div className="relative">
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="number" value={f.value} onChange={(e) => f.set(e.target.value)}
                      placeholder={f.placeholder} min="0" max={f.max} step={f.step}
                      className={inputClass + (f.suffix ? " pr-10" : "")}
                      style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text, borderRadius: t.borderRadius }}
                      onFocus={(e) => { e.target.style.borderColor = f.color; }}
                      onBlur={(e) => { e.target.style.borderColor = t.border; }}
                    />
                    {f.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: t.muted }}>{f.suffix}</span>}
                  </div>
                </div>
              ))}

              <motion.button
                type="submit" disabled={saving}
                whileHover={!saving ? { scale: 1.02, boxShadow: `0 0 25px ${t.accent}40` } : {}}
                whileTap={!saving ? { scale: 0.96 } : {}}
                className="w-full py-3 rounded text-sm border-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ fontFamily: t.titleFont, borderColor: t.accent, color: t.accent, borderRadius: t.borderRadius, background: `${t.accent}08` }}>
                {saving ? "儲存中..." : "💾 儲存分數"}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center text-xs py-4" style={{ borderTop: `1px solid ${t.border}`, color: t.muted }}>
              請選取年級、班別、學號，或直接從姓名選取玩家
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }}
            className="mt-4 p-3 rounded text-xs text-center border overflow-hidden"
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

      {showConfetti && <ConfettiEffect onComplete={() => setShowConfetti(false)} />}
    </motion.div>
  );
}
