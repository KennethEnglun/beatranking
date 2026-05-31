import { motion, AnimatePresence } from "framer-motion";

const RANK_COLORS = {
  1: { bg: "bg-yellow-500/10", text: "text-yellow-400", icon: "🥇", glow: "text-glow-yellow", shadow: "0 0 12px rgba(255,215,0,0.15)" },
  2: { bg: "bg-gray-300/10", text: "text-gray-300", icon: "🥈", glow: "", shadow: "0 0 8px rgba(192,192,192,0.1)" },
  3: { bg: "bg-amber-600/10", text: "text-amber-500", icon: "🥉", glow: "", shadow: "0 0 8px rgba(205,127,50,0.1)" },
};

export default function RankRow({ row, index, prevData, groupColor }) {
  const rankStyle = RANK_COLORS[row.rank] || {};
  const prevRow = prevData?.find((p) => p.id === row.id);
  const rankChanged = prevRow && prevRow.rank !== row.rank;
  const scoreChanged = prevRow &&
    (prevRow.completion_rate !== row.completion_rate ||
      prevRow.max_combo !== row.max_combo ||
      prevRow.perfect_count !== row.perfect_count);

  const borderColors = {
    "neon-cyan": "border-neon-cyan/20",
    "neon-magenta": "border-neon-magenta/20",
    "neon-green": "border-neon-green/20",
  };
  const borderColor = borderColors[groupColor] || borderColors["neon-cyan"];

  const isTop3 = row.rank <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -30 }}
      animate={{
        opacity: 1,
        x: 0,
        backgroundColor: scoreChanged ? "rgba(0,255,255,0.05)" : (rankChanged ? "rgba(255,255,0,0.03)" : "rgba(0,0,0,0)"),
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 18,
        delay: index * 0.04,
        backgroundColor: { duration: 0.3 },
      }}
      whileHover={{
        scale: 1.01,
        backgroundColor: "rgba(255,255,255,0.04)",
        transition: { duration: 0.15 },
      }}
      className={`grid grid-cols-6 gap-2 px-4 py-2.5 border-b ${borderColor} ${rankStyle.bg || ""} ${isTop3 ? "" : ""}`}
      style={{ boxShadow: rankStyle.shadow }}
    >
      <div className={`text-center font-game text-sm flex items-center justify-center gap-1 ${rankStyle.glow || ""}`}>
        {rankStyle.icon ? (
          <motion.span
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
            className="text-lg cursor-default"
          >
            {rankStyle.icon}
          </motion.span>
        ) : (
          <motion.span
            className={`text-lg ${row.rank <= 3 ? rankStyle.text : "text-gray-500"}`}
            layout
          >
            {row.rank}
          </motion.span>
        )}
        {row.rank > 3 && <span className="text-gray-500 text-xs">#{row.rank}</span>}
        {rankChanged && (
          <motion.span
            initial={{ y: prevRow.rank < row.rank ? -10 : 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`text-[10px] ml-0.5 ${prevRow.rank < row.rank ? "text-red-400" : "text-neon-green"}`}
          >
            {prevRow.rank < row.rank ? "↓" : "↑"}
          </motion.span>
        )}
      </div>

      <motion.div
        layout
        className="flex items-center font-bold text-sm text-white truncate"
      >
        {isTop3 && (
          <motion.div
            layout
            className={`w-1 h-4 ${row.rank === 1 ? "bg-yellow-400" : row.rank === 2 ? "bg-gray-300" : "bg-amber-500"} rounded-full mr-1.5`}
          />
        )}
        {row.name}
      </motion.div>

      <div className="text-center text-xs text-gray-400 flex items-center justify-center">
        {row.grade}{row.class}
      </div>

      <div className="text-center flex items-center justify-center">
        <motion.span
          key={`${row.id}-${row.completion_rate}`}
          initial={scoreChanged ? { scale: 1.3, color: "#39ff14" } : false}
          animate={{ scale: 1, color: row.completion_rate >= 90 ? "#39ff14" : row.completion_rate >= 70 ? "#ffff00" : "#d1d5db" }}
          transition={{ type: "spring", stiffness: 200 }}
          className="font-mono text-sm"
        >
          {row.completion_rate}%
        </motion.span>
      </div>

      <div className="text-center flex items-center justify-center">
        <motion.span
          key={`${row.id}-${row.max_combo}`}
          initial={scoreChanged ? { scale: 1.3 } : false}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className={`font-mono text-sm ${row.max_combo >= 500 ? "text-neon-magenta" : "text-gray-300"}`}
        >
          {row.max_combo}
        </motion.span>
      </div>

      <div className="text-center flex items-center justify-center">
        <motion.span
          key={`${row.id}-${row.perfect_count}`}
          initial={scoreChanged ? { scale: 1.3 } : false}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.05 }}
          className={`font-mono text-sm ${row.perfect_count >= 300 ? "text-neon-cyan" : "text-gray-300"}`}
        >
          {row.perfect_count}
        </motion.span>
      </div>
    </motion.div>
  );
}
