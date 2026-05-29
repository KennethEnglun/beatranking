import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchAllPlayers, fetchScore, saveScore } from "../lib/api";

const GRADES = ["1", "2", "3", "4", "5", "6"];

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
      fetchScore(selectedPlayer.id).then((score) => {
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
    } else {
      setCompletionRate("");
      setMaxCombo("");
      setPerfectCount("");
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
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const targetId = selectedPlayer?.id;
    if (!targetId) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveScore(
        targetId,
        parseFloat(completionRate) || 0,
        parseInt(maxCombo) || 0,
        parseInt(perfectCount) || 0
      );
      setMessage({ type: "success", text: `✅ ${selectedPlayer.name} 分數已儲存！` });
      clearPlayers();
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
            onChange={(e) => { setGrade(e.target.value); setPlayerId(""); }}
            className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
              focus:outline-none focus:border-neon-magenta transition-all duration-300
              appearance-none cursor-pointer"
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
              focus:outline-none focus:border-neon-magenta transition-all duration-300
              appearance-none cursor-pointer"
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
              focus:outline-none focus:border-neon-magenta transition-all duration-300
              appearance-none cursor-pointer"
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
                if (p) {
                  setGrade(String(p.grade));
                  setCls(p.class);
                  setStudentNumber(p.student_number);
                }
              }
            }}
            className="w-full px-3 py-2.5 bg-cyber-bg border border-cyber-border rounded text-white text-sm
              focus:outline-none focus:border-neon-magenta transition-all duration-300
              appearance-none cursor-pointer"
          >
            <option value="">所有姓名</option>
            {available.names.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.grade}{p.class} {p.student_number})
              </option>
            ))}
          </select>
        </div>

        {/* 已選玩家顯示 & 分數輸入 */}
        {selectedPlayer ? (
          <div className="border-t border-cyber-border pt-4 space-y-4 animate-fade-in">
            <div className="px-3 py-2 bg-neon-cyan/5 border border-neon-cyan/30 rounded text-center">
              <span className="text-neon-cyan text-sm font-bold">
                已選：{selectedPlayer.name}（{selectedPlayer.grade}{selectedPlayer.class} {selectedPlayer.student_number}）
              </span>
              <button
                type="button"
                onClick={clearPlayers}
                className="ml-3 text-xs text-gray-500 hover:text-neon-magenta transition-colors"
              >
                ✕ 清除
              </button>
            </div>

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
        ) : (
          <div className="text-center text-gray-600 text-xs py-4 border-t border-cyber-border">
            請選取年級、班別、學號，或直接從姓名選取玩家
          </div>
        )}
      </form>

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
