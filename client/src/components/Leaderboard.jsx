import { useState, useEffect, useRef, useCallback } from "react";
import { fetchLeaderboard } from "../lib/api";
import RankRow from "./RankRow";

const GROUPS = [
  { key: "low", label: "低年級組", grades: "1-2年級", color: "neon-cyan" },
  { key: "mid", label: "中年級組", grades: "3-4年級", color: "neon-magenta" },
  { key: "high", label: "高年級組", grades: "5-6年級", color: "neon-green" },
];

export default function Leaderboard() {
  const [group, setGroup] = useState("low");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const prevDataRef = useRef([]);

  const loadData = useCallback(async () => {
    try {
      const result = await fetchLeaderboard(group);
      prevDataRef.current = data;
      // 避免初始載入時播放動畫
      if (data.length === 0) prevDataRef.current = result;
      setData(result);
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [group, data]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [group]);

  useEffect(() => {
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  const activeGroup = GROUPS.find((g) => g.key === group);
  const colorMap = {
    "neon-cyan": { text: "text-neon-cyan", border: "border-neon-cyan", glow: "shadow-[0_0_15px_rgba(0,255,255,0.2)]" },
    "neon-magenta": { text: "text-neon-magenta", border: "border-neon-magenta", glow: "shadow-[0_0_15px_rgba(255,0,255,0.2)]" },
    "neon-green": { text: "text-neon-green", border: "border-neon-green", glow: "shadow-[0_0_15px_rgba(57,255,20,0.2)]" },
  };
  const activeColor = colorMap[activeGroup?.color] || colorMap["neon-cyan"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* 組別切換 */}
      <div className="flex justify-center gap-2 mb-6">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => setGroup(g.key)}
            className={`px-4 sm:px-6 py-2.5 rounded text-xs sm:text-sm font-game border-2 transition-all duration-300 ${
              group === g.key
                ? `${colorMap[g.color].border} ${colorMap[g.color].text} ${colorMap[g.color].glow}`
                : "border-cyber-border text-gray-500 hover:border-gray-600"
            }`}
          >
            <div>{g.label}</div>
            <div className="text-[10px] mt-0.5 opacity-70">{g.grades}</div>
          </button>
        ))}
      </div>

      {/* 排行榜表格 */}
      <div className={`bg-cyber-card/90 backdrop-blur-sm rounded-lg border ${activeColor.border} ${activeColor.glow} overflow-hidden`}>
        {/* 表頭 */}
        <div className="grid grid-cols-6 gap-2 px-4 py-3 bg-cyber-bg border-b border-cyber-border text-xs font-game text-gray-400">
          <div className="text-center">排名</div>
          <div>姓名</div>
          <div className="text-center">班級</div>
          <div className="text-center">完成率%</div>
          <div className="text-center">最大連擊</div>
          <div className="text-center">Perfect</div>
        </div>

        {/* 資料列 */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading && data.length === 0 ? (
            <div className="py-12 text-center text-gray-500 animate-pulse">
              <div className="text-4xl mb-3">🎮</div>
              <div className="font-game text-sm">載入中...</div>
            </div>
          ) : data.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <div className="text-4xl mb-3">📭</div>
              <div className="font-game text-sm">暫無數據</div>
              <div className="text-xs mt-1">請透過管理面板上載玩家及輸入分數</div>
            </div>
          ) : (
            data.map((row, i) => (
              <RankRow key={row.id} row={row} index={i} prevData={prevDataRef.current} groupColor={activeGroup.color} />
            ))
          )}
        </div>
      </div>

      {/* 更新時間 */}
      {lastUpdate && data.length > 0 && (
        <div className="text-center mt-4 text-gray-600 text-xs">
          <span className="text-neon-cyan/50">●</span> 最後更新: {lastUpdate.toLocaleTimeString("zh-HK")}
          <span className="ml-2 text-neon-cyan/30 text-[10px]">(每8秒自動更新)</span>
        </div>
      )}
    </div>
  );
}
