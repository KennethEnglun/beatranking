import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllPlayers, fetchBestScore, saveScore, analyzeScoreImage } from "../lib/api";

const GRADES = ["1", "2", "3", "4", "5", "6"];

const fadeIn = {
  hidden: { opacity: 0, y: 10, height: 0 },
  visible: { opacity: 1, y: 0, height: "auto", transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, height: 0, transition: { duration: 0.2 } },
};

const inputFocus = { scale: 1.01, transition: { duration: 0.2 } };

export default function ScoreEntry() {
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
  const [bestScore, setBestScore] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAllPlayers().then(setAllPlayers).catch(() => {});
  }, []);

  const filterBy = useCallback(
    (players, exclude) => {
      return players.filter((p) => {
        if (exclude !== "grade" && grade && String(p.grade) !== grade) return false;
        if (exclude !== "cls" && cls && p.class !== cls) return false;
        if (exclude !== "studentNumber" && studentNumber && p.student_number !== studentNumber) return false;
        if (exclude !== "playerId" && playerId && String(p.id) !== playerId) return false;
        return true;
      });
    },
    [grade, cls, studentNumber, playerId]
  );

  const available = useMemo(() => {
    const grades = [...new Set(filterBy(allPlayers, "grade").map((p) => String(p.grade)))].sort();
    const classes = [...new Set(filterBy(allPlayers, "cls").map((p) => p.class))].sort();
    const studentNumbers = [...new Set(filterBy(allPlayers, "studentNumber").map((p) => p.student_number))].sort();
    const names = filterBy(allPlayers, "playerId");
    return { grades, classes, studentNumbers, names };
  }, [allPlayers, filterBy]);

  const selectedPlayer = useMemo(() => {
    if (playerId) return allPlayers.find((p) => String(p.id) === playerId);
    if (grade && cls && studentNumber) {
      return allPlayers.find(
        (p) => String(p.grade) === grade && p.class === cls && p.student_number === studentNumber
      );
    }
    return null;
  }, [playerId, grade, cls, studentNumber, allPlayers]);

  useEffect(() => {
    if (selectedPlayer) {
      setGrade(String(selectedPlayer.grade));
      setCls(selectedPlayer.class);
      setStudentNumber(selectedPlayer.student_number);
      setPlayerId(String(selectedPlayer.id));
      setBestScore(null);
      fetchBestScore(selectedPlayer.id).then((score) => setBestScore(score));
    } else {
      setBestScore(null);
    }
  }, [selectedPlayer]);

  function clearPlayers() {
    setGrade("");
    setCls("");
    setStudentNumber("");
    setPlayerId("");
    setCompletionRate("");
    setMaxCombo("");
    setPerfectCount("");
    setBestScore(null);
    setImageFile(null);
    setImagePreview(null);
    setAiResult(null);
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAiResult(null);
  }

  async function handleAnalyze() {
    if (!imageFile) return;
    setAnalyzing(true);
    setAiResult(null);
    setMessage(null);
    try {
      const result = await analyzeScoreImage(imageFile);
      setAiResult(result);
    } catch (err) {
      setMessage({ type: "error", text: `❌ ${err.message || "分析失敗"}` });
    } finally {
      setAnalyzing(false);
    }
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
    const targetId = selectedPlayer?.id;
    if (!targetId) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveScore(targetId, parseFloat(completionRate) || 0, parseInt(maxCombo) || 0, parseInt(perfectCount) || 0);
      setMessage({ type: "success", text: `✅ ${selectedPlayer.name} 分數已儲存！` });
      clearPlayers();
    } catch (err) {
      setMessage({ type: "error", text: `❌ ${err.message || "儲存失敗，請重試"}` });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3 className="font-game text-sm text-neon-magenta mb-4 text-center">🎯 輸入玩家分數</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 年級 */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">年級</label>
          <select
            value={grade}
            onChange={(e) => { setGrade(e.target.value); setPlayerId(""); }}
            className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
              focus:outline-none focus:border-neon-magenta appearance-none cursor-pointer transition-colors"
          >
            <option value="">所有年級</option>
            {GRADES.filter((g) => available.grades.length === 0 || available.grades.includes(g)).map((g) => (
              <option key={g} value={g}>{g}年級</option>
            ))}
          </select>
        </div>

        {/* 班別 */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">班別</label>
          <select
            value={cls}
            onChange={(e) => { setCls(e.target.value); setPlayerId(""); }}
            className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
              focus:outline-none focus:border-neon-magenta appearance-none cursor-pointer transition-colors"
          >
            <option value="">所有班別</option>
            {available.classes.map((c) => (
              <option key={c} value={c}>{c}班</option>
            ))}
          </select>
        </div>

        {/* 學號 */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">學號</label>
          <select
            value={studentNumber}
            onChange={(e) => { setStudentNumber(e.target.value); setPlayerId(""); }}
            className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
              focus:outline-none focus:border-neon-magenta appearance-none cursor-pointer transition-colors"
          >
            <option value="">所有學號</option>
            {available.studentNumbers.map((sn) => (
              <option key={sn} value={sn}>{sn}</option>
            ))}
          </select>
        </div>

        {/* 姓名 */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">姓名</label>
          <select
            value={playerId}
            onChange={(e) => {
              const id = e.target.value;
              setPlayerId(id);
              if (id) {
                const p = allPlayers.find((p) => String(p.id) === id);
                if (p) { setGrade(String(p.grade)); setCls(p.class); setStudentNumber(p.student_number); }
              }
            }}
            className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
              focus:outline-none focus:border-neon-magenta appearance-none cursor-pointer transition-colors"
          >
            <option value="">所有姓名</option>
            {available.names.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.grade}{p.class} {p.student_number})</option>
            ))}
          </select>
        </div>

        {/* 已選玩家 */}
        <AnimatePresence>
          {selectedPlayer ? (
            <motion.div
              key="player-form"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="border-t border-cyber-border pt-4 space-y-4"
            >
              <div className="px-3 py-2 bg-neon-cyan/5 border border-neon-cyan/30 rounded text-center">
                <span className="text-neon-cyan text-sm font-bold">
                  已選：{selectedPlayer.name}（{selectedPlayer.grade}{selectedPlayer.class} {selectedPlayer.student_number}）
                </span>
                <button type="button" onClick={clearPlayers} className="ml-3 text-xs text-gray-500 hover:text-neon-magenta transition-colors">
                  ✕ 清除
                </button>
              </div>

              <AnimatePresence>
                {bestScore && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="px-3 py-2 bg-neon-yellow/5 border border-neon-yellow/20 rounded text-xs text-gray-400"
                  >
                    <span className="text-neon-yellow">最佳記錄參考：</span>
                    完成率 <span className="text-neon-green">{bestScore.completion_rate}%</span>
                    <span className="mx-1.5 text-gray-600">|</span>
                    最大連擊 <span className="text-neon-magenta">{bestScore.max_combo}</span>
                    <span className="mx-1.5 text-gray-600">|</span>
                    Perfect <span className="text-neon-cyan">{bestScore.perfect_count}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI 圖片分析區 */}
              <div className="border border-neon-magenta/20 rounded p-3 bg-neon-magenta/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-neon-magenta font-game">🤖 AI 截圖分析</span>
                  <span className="text-[10px] text-gray-600">上傳遊戲截圖，AI 自動辨識分數</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />

                <div className="flex gap-2 mb-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03, boxShadow: "0 0 10px rgba(0,255,255,0.2)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 py-2 rounded text-[10px] font-game border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
                  >
                    📷 拍照
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03, boxShadow: "0 0 10px rgba(255,0,255,0.2)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 rounded text-[10px] font-game border border-neon-magenta/50 text-neon-magenta hover:bg-neon-magenta/10 transition-colors"
                  >
                    📁 上傳圖片
                  </motion.button>
                </div>

                <AnimatePresence>
                  {imagePreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <img src={imagePreview} alt="截圖預覽" className="w-full rounded border border-cyber-border mb-2 max-h-48 object-contain" />
                      {!aiResult && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleAnalyze}
                          disabled={analyzing}
                          className="w-full py-2 rounded text-[10px] font-game border-2 border-neon-yellow text-neon-yellow
                            bg-neon-yellow/5 hover:bg-neon-yellow/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          {analyzing ? (
                            <span className="flex items-center justify-center gap-1">
                              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>⏳</motion.span>
                              分析中...
                            </span>
                          ) : "🤖 分析圖片"}
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {aiResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-cyber-bg/50 rounded p-2 border border-neon-green/30">
                        <div className="text-xs text-gray-400 mb-1">AI 分析結果：</div>
                        <div className="flex gap-2 text-xs font-mono mb-2">
                          <motion.span initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-neon-green">
                            {aiResult.completion_rate != null ? `${aiResult.completion_rate}%` : "—"}
                          </motion.span>
                          <span className="text-gray-600">|</span>
                          <motion.span initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ delay: 0.05 }} className="text-neon-magenta">
                            連擊 {aiResult.max_combo != null ? aiResult.max_combo : "—"}
                          </motion.span>
                          <span className="text-gray-600">|</span>
                          <motion.span initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="text-neon-cyan">
                            Perfect {aiResult.perfect_count != null ? aiResult.perfect_count : "—"}
                          </motion.span>
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.03, boxShadow: "0 0 12px rgba(57,255,20,0.3)" }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleFillScores}
                          className="w-full py-1.5 rounded text-[10px] font-game border border-neon-green text-neon-green hover:bg-neon-green/15 transition-colors"
                        >
                          ✅ 填入分數欄位
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 分數輸入 */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">完成率 %</label>
                <div className="relative">
                  <motion.input
                    whileFocus={inputFocus}
                    type="number" value={completionRate} onChange={(e) => setCompletionRate(e.target.value)}
                    placeholder="0" min="0" max="100" step="0.01"
                    className="w-full px-3 py-2.5 pr-10 bg-cyber-bg border border-cyber-border rounded text-white text-sm
                      focus:outline-none focus:border-neon-green transition-colors font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">最大連擊</label>
                <motion.input
                  whileFocus={inputFocus}
                  type="number" value={maxCombo} onChange={(e) => setMaxCombo(e.target.value)}
                  placeholder="0" min="0"
                  className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
                    focus:outline-none focus:border-neon-magenta transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Perfect 數量</label>
                <motion.input
                  whileFocus={inputFocus}
                  type="number" value={perfectCount} onChange={(e) => setPerfectCount(e.target.value)}
                  placeholder="0" min="0"
                  className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
                    focus:outline-none focus:border-neon-cyan transition-colors font-mono"
                />
              </div>

              <motion.button
                type="submit"
                disabled={saving}
                whileHover={!saving ? { scale: 1.02, boxShadow: "0 0 25px rgba(57,255,20,0.4)" } : {}}
                whileTap={!saving ? { scale: 0.96 } : {}}
                className="w-full py-3 rounded font-game text-sm border-2 border-neon-green text-neon-green
                  bg-neon-green/5 hover:bg-neon-green/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                    儲存中...
                  </motion.span>
                ) : "💾 儲存分數"}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-600 text-xs py-4 border-t border-cyber-border"
            >
              請選取年級、班別、學號，或直接從姓名選取玩家
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className={`mt-4 p-3 rounded text-xs text-center font-game border overflow-hidden ${
              message.type === "success"
                ? "border-neon-green/50 text-neon-green bg-neon-green/5"
                : "border-red-500/50 text-red-400 bg-red-900/10"
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
