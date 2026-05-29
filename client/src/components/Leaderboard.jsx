import { useState, useEffect, useRef, useCallback } from "react";
import { fetchLeaderboard } from "../lib/api";
import RankRow from "./RankRow";

const GROUPS = [
  { key: "low", label: "低年級組", grades: "1-2年級", color: "neon-cyan" },
  { key: "mid", label: "中年級組", grades: "3-4年級", color: "neon-magenta" },
  { key: "high", label: "高年級組", grades: "5-6年級", color: "neon-green" },
];

const ROTATION_INTERVAL = 5000;

export default function Leaderboard() {
  const [selectedGroup, setSelectedGroup] = useState("low");
  const [rotating, setRotating] = useState(false);
  const [rotationIdx, setRotationIdx] = useState(0);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [countdown, setCountdown] = useState(ROTATION_INTERVAL / 1000);
  const prevDataRef = useRef([]);

  const group = rotating ? GROUPS[rotationIdx].key : selectedGroup;

  const loadData = useCallback(async () => {
    try {
      const result = await fetchLeaderboard(group);
      prevDataRef.current = data;
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

  useEffect(() => {
    if (!rotating) return;
    const interval = setInterval(() => {
      setRotationIdx((prev) => (prev + 1) % GROUPS.length);
    }, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [rotating]);

  useEffect(() => {
    if (!rotating) return;
    setCountdown(ROTATION_INTERVAL / 1000);
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 0.1 ? ROTATION_INTERVAL / 1000 : prev - 0.1));
    }, 100);
    return () => clearInterval(timer);
  }, [rotating, rotationIdx]);

  function stopRotating() {
    setRotating(false);
    setSelectedGroup(group);
  }

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
      <div className="flex justify-center flex-wrap gap-2 mb-2">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => { setSelectedGroup(g.key); setRotating(false); }}
            className={`px-4 sm:px-6 py-2.5 rounded text-xs sm:text-sm font-game border-2 transition-all duration-300 ${
              group === g.key && !rotating
                ? `${colorMap[g.color].border} ${colorMap[g.color].text} ${colorMap[g.color].glow}`
                : "border-cyber-border text-gray-500 hover:border-gray-600"
            }`}
          >
            <div>{g.label}</div>
            <div className="text-[10px] mt-0.5 opacity-70">{g.grades}</div>
          </button>
        ))}
        <button
          onClick={() => { setRotating(!rotating); if (!rotating) setRotationIdx(GROUPS.findIndex((g) => g.key === selectedGroup)); }}
          className={`px-4 sm:px-6 py-2.5 rounded text-xs sm:text-sm font-game border-2 transition-all duration-300 ${
            rotating
              ? "border-neon-yellow text-neon-yellow shadow-[0_0_15px_rgba(255,255,0,0.2)] animate-pulse"
              : "border-cyber-border text-gray-500 hover:border-neon-yellow/50 hover:text-neon-yellow/70"
          }`}
        >
          <div>🔄 輪播</div>
          <div className="text-[10px] mt-0.5 opacity-70">自動切換</div>
        </button>
      </div>

      {/* 輪播進度條 */}
      {rotating && (
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-3 bg-cyber-bg/80 rounded-full px-4 py-1.5 border border-neon-yellow/30">
            {GROUPS.map((g, i) => (
              <div
                key={g.key}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  i === rotationIdx
                    ? `${g.color === "neon-cyan" ? "bg-neon-cyan shadow-[0_0_6px_#00ffff]" : g.color === "neon-magenta" ? "bg-neon-magenta shadow-[0_0_6px_#ff00ff]" : "bg-neon-green shadow-[0_0_6px_#39ff14]"} scale-125`
                    : "bg-gray-700"
                }`}
              />
            ))}
            <span className="text-[10px] font-mono text-neon-yellow ml-1">{countdown.toFixed(1)}s</span>
            <button
              onClick={stopRotating}
              className="text-[10px] text-gray-500 hover:text-neon-magenta transition-colors ml-1"
            >
              ✕ 停止
            </button>
          </div>
        </div>
      )}

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
