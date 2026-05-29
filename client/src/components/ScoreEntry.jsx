import { useState, useEffect } from "react";
import { fetchPlayers, fetchScore, saveScore } from "../lib/api";

const GRADES = ["1", "2", "3", "4", "5", "6"];

export default function ScoreEntry() {
  const [grade, setGrade] = useState("");
  const [cls, setCls] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState("");

  const [players, setPlayers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  const [completionRate, setCompletionRate] = useState("");
  const [maxCombo, setMaxCombo] = useState("");
  const [perfectCount, setPerfectCount] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // 當年級改變時載入對應的班別
  useEffect(() => {
    if (!grade) {
      setClasses([]);
      setCls("");
      return;
    }
    fetchPlayers(grade).then((data) => {
      setPlayers(data);
      const uniqueClasses = [...new Set(data.map((p) => p.class))].sort();
      setClasses(uniqueClasses);
      setCls("");
    });
  }, [grade]);

  // 當年級和班別都選好時篩選學生
  useEffect(() => {
    if (!grade || !cls) {
      setFilteredStudents([]);
      setStudentNumber("");
      return;
    }
    const filtered = players.filter((p) => p.class === cls);
    setFilteredStudents(filtered);
    setStudentNumber("");
  }, [grade, cls, players]);

  // 當學號選好時自動顯示姓名和載入現有分數
  useEffect(() => {
    if (!studentNumber) {
      setPlayerId(null);
      setPlayerName("");
      setCompletionRate("");
      setMaxCombo("");
      setPerfectCount("");
      return;
    }
    const player = filteredStudents.find((p) => p.student_number === studentNumber);
    if (player) {
      setPlayerId(player.id);
      setPlayerName(player.name);
      // 載入現有分數
      fetchScore(player.id).then((score) => {
        if (score) {
          setCompletionRate(String(score.completion_rate));
          setMaxCombo(String(score.max_combo));
          setPerfectCount(String(score.perfect_count));
        } else {
          setCompletionRate("");
          setMaxCombo("");
          setPerfectCount("");
        }
      });
    }
  }, [studentNumber, filteredStudents]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!playerId) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveScore(
        playerId,
        parseFloat(completionRate) || 0,
        parseInt(maxCombo) || 0,
        parseInt(perfectCount) || 0
      );
      setMessage({ type: "success", text: `✅ ${playerName} 分數已儲存！` });
    } catch {
      setMessage({ type: "error", text: "❌ 儲存失敗，請重試" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div>
      <h3 className="font-game text-sm text-neon-magenta mb-4 text-center">🎯 輸入玩家分數</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 年級 */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">年級</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
              focus:outline-none focus:border-neon-magenta transition-all duration-300
              appearance-none cursor-pointer"
          >
            <option value="">選擇年級</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}年級</option>
            ))}
          </select>
        </div>

        {/* 班別 */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">班別</label>
          <select
            value={cls}
            onChange={(e) => setCls(e.target.value)}
            disabled={!grade}
            className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
              focus:outline-none focus:border-neon-magenta transition-all duration-300
              appearance-none cursor-pointer disabled:opacity-30"
          >
            <option value="">選擇班別</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}班</option>
            ))}
          </select>
        </div>

        {/* 學號 */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">學號</label>
          <select
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            disabled={!cls}
            className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
              focus:outline-none focus:border-neon-magenta transition-all duration-300
              appearance-none cursor-pointer disabled:opacity-30"
          >
            <option value="">選擇學號</option>
            {filteredStudents.map((p) => (
              <option key={p.id} value={p.student_number}>
                {p.student_number}
              </option>
            ))}
          </select>
        </div>

        {/* 姓名 (自動顯示) */}
        {playerName && (
          <div className="animate-fade-in">
            <label className="block text-xs text-gray-400 mb-1.5">姓名</label>
            <div className="px-3 py-2.5 bg-cyber-bg border border-neon-cyan/50 rounded text-neon-cyan text-sm font-bold shadow-[0_0_8px_rgba(0,255,255,0.1)]">
              {playerName}
            </div>
          </div>
        )}

        {/* 分隔線 */}
        {playerId && (
          <div className="border-t border-cyber-border pt-4 space-y-4 animate-fade-in">
            {/* 完成率 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">完成率 %</label>
              <div className="relative">
                <input
                  type="number"
                  value={completionRate}
                  onChange={(e) => setCompletionRate(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2.5 pr-10 bg-cyber-bg border border-cyber-border rounded text-white text-sm
                    focus:outline-none focus:border-neon-green transition-all duration-300 font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
              </div>
            </div>

            {/* 最大連擊 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">最大連擊</label>
              <input
                type="number"
                value={maxCombo}
                onChange={(e) => setMaxCombo(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
                  focus:outline-none focus:border-neon-magenta transition-all duration-300 font-mono"
              />
            </div>

            {/* Perfect 數量 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Perfect 數量</label>
              <input
                type="number"
                value={perfectCount}
                onChange={(e) => setPerfectCount(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
                  focus:outline-none focus:border-neon-cyan transition-all duration-300 font-mono"
              />
            </div>

            {/* 提交按鈕 */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded font-game text-sm border-2 border-neon-green text-neon-green
                bg-neon-green/5 hover:bg-neon-green/15 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-300 active:scale-[0.98]"
            >
              {saving ? "儲存中..." : "💾 儲存分數"}
            </button>
          </div>
        )}
      </form>

      {/* 訊息提示 */}
      {message && (
        <div className={`mt-4 p-3 rounded text-xs text-center font-game border animate-fade-in ${
          message.type === "success"
            ? "border-neon-green/50 text-neon-green bg-neon-green/5"
            : "border-red-500/50 text-red-400 bg-red-900/10"
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
