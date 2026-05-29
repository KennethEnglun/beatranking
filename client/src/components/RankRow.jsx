import { useState, useEffect } from "react";

const RANK_COLORS = {
  1: { bg: "bg-yellow-500/10", text: "text-yellow-400", icon: "🥇", glow: "text-glow-yellow" },
  2: { bg: "bg-gray-300/10", text: "text-gray-300", icon: "🥈", glow: "" },
  3: { bg: "bg-amber-600/10", text: "text-amber-500", icon: "🥉", glow: "" },
};

export default function RankRow({ row, index, prevData, groupColor }) {
  const rankStyle = RANK_COLORS[row.rank] || {};
  const [animate, setAnimate] = useState(false);

  const prevRow = prevData?.find((p) => p.id === row.id);
  const rankChanged = prevRow && prevRow.rank !== row.rank;
  const scoreChanged =
    prevRow &&
    (prevRow.completion_rate !== row.completion_rate ||
      prevRow.max_combo !== row.max_combo ||
      prevRow.perfect_count !== row.perfect_count);

  useEffect(() => {
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 1000);
    return () => clearTimeout(t);
  }, [row.completion_rate, row.max_combo, row.perfect_count, row.rank]);

  const borderColors = {
    "neon-cyan": "border-neon-cyan/20",
    "neon-magenta": "border-neon-magenta/20",
    "neon-green": "border-neon-green/20",
  };
  const borderColor = borderColors[groupColor] || borderColors["neon-cyan"];

  return (
    <div
      className={`grid grid-cols-6 gap-2 px-4 py-2.5 border-b ${borderColor} ${rankStyle.bg || ""}
        transition-all duration-500 ease-out
        ${animate && scoreChanged ? "bg-neon-cyan/5" : ""}
        ${rankChanged ? "bg-neon-yellow/5" : ""}
        hover:bg-cyber-border/30`}
      style={{
        animationDelay: `${index * 30}ms`,
        animation: "rank-appear 0.4s ease-out forwards",
      }}
    >
      {/* 排名 */}
      <div className={`text-center font-game text-sm flex items-center justify-center gap-1 ${rankStyle.glow || ""}`}>
        {rankStyle.icon ? (
          <span className="text-lg">{rankStyle.icon}</span>
        ) : (
          <span className={`text-lg ${row.rank <= 3 ? "" : "text-gray-500"}`}>{row.rank}</span>
        )}
        {row.rank > 3 && <span className="text-gray-500 text-xs">#{row.rank}</span>}
        {rankChanged && (
          <span className={`text-[10px] ml-0.5 ${prevRow.rank < row.rank ? "text-red-400" : "text-neon-green"} animate-pulse`}>
            {prevRow.rank < row.rank ? "↓" : "↑"}
          </span>
        )}
      </div>

      {/* 姓名 */}
      <div className="flex items-center font-bold text-sm text-white truncate">
        {row.name}
      </div>

      {/* 班級 */}
      <div className="text-center text-xs text-gray-400 flex items-center justify-center">
        {row.grade}{row.class}
      </div>

      {/* 完成率 */}
      <div className="text-center flex items-center justify-center">
        <span className={`font-mono text-sm ${row.completion_rate >= 90 ? "text-neon-green" : row.completion_rate >= 70 ? "text-neon-yellow" : "text-gray-300"}`}>
          {row.completion_rate}%
        </span>
      </div>

      {/* 最大連擊 */}
      <div className="text-center flex items-center justify-center">
        <span className={`font-mono text-sm ${row.max_combo >= 500 ? "text-neon-magenta" : "text-gray-300"}`}>
          {row.max_combo}
        </span>
      </div>

      {/* Perfect */}
      <div className="text-center flex items-center justify-center">
        <span className={`font-mono text-sm ${row.perfect_count >= 300 ? "text-neon-cyan" : "text-gray-300"}`}>
          {row.perfect_count}
        </span>
      </div>
    </div>
  );
}
