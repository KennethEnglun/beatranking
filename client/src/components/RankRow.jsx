import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useTheme } from "../lib/ThemeContext";
import RollingNumber from "./RollingNumber";

export default function RankRow({ row, index, prevData, groupColor }) {
  const { t } = useTheme();
  const numRef = useRef(null);
  const prevRow = prevData?.find((p) => p.id === row.id);
  const rankChanged = prevRow && prevRow.rank !== row.rank;
  const scoreChanged = prevRow &&
    (prevRow.completion_rate !== row.completion_rate || prevRow.max_combo !== row.max_combo || prevRow.perfect_count !== row.perfect_count);
  const isTop3 = row.rank <= 3;
  const RANK_COLORS = { 1: { text: "#ffd700", icon: "🥇" }, 2: { text: "#c0c0c0", icon: "🥈" }, 3: { text: "#cd7f32", icon: "🥉" } };
  const rankStyle = RANK_COLORS[row.rank] || {};

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, x: -30, rotation: -3 }, {
      opacity: 1, x: 0, rotation: 0,
      duration: 0.5, delay: index * 0.03,
      ease: "back.out(1.5)",
    });
  }, [index]);

  return (
    <motion.div
      ref={numRef}
      layout
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0, backgroundColor: scoreChanged ? `${t.primary}08` : (rankChanged ? `${t.yellow}05` : "rgba(0,0,0,0)") }}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay: index * 0.04, backgroundColor: { duration: 0.3 } }}
      whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.03)", transition: { duration: 0.15 } }}
      className="grid grid-cols-6 gap-2 px-4 py-2.5"
      style={{ borderBottom: `1px solid ${t.border}` }}
    >
      <div className="text-center text-sm flex items-center justify-center gap-1" style={{ fontFamily: t.titleFont }}>
        {rankStyle.icon ? (
          <motion.span animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }} className="text-lg cursor-default">{rankStyle.icon}</motion.span>
        ) : (
          <motion.span layout style={{ color: t.muted }}>{row.rank}</motion.span>
        )}
        {row.rank > 3 && <span className="text-xs" style={{ color: t.muted }}>#{row.rank}</span>}
        {rankChanged && (
          <motion.span initial={{ y: prevRow.rank < row.rank ? -10 : 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[10px] ml-0.5" style={{ color: prevRow.rank < row.rank ? "#ff6666" : t.accent }}>
            {prevRow.rank < row.rank ? "↓" : "↑"}
          </motion.span>
        )}
      </div>
      <motion.div layout className="flex items-center font-bold text-sm truncate" style={{ color: t.text }}>
        {isTop3 && <motion.div layout className="w-1.5 h-4 rounded-full mr-1.5" style={{ background: row.rank === 1 ? "#ffd700" : row.rank === 2 ? "#c0c0c0" : "#cd7f32" }} />}
        {row.name}
      </motion.div>
      <div className="text-center text-xs flex items-center justify-center" style={{ color: t.muted }}>{row.grade}{row.class}</div>
      <div className="text-center flex items-center justify-center">
        <motion.span key={`${row.id}-${row.completion_rate}`} initial={scoreChanged ? { scale: 1.3, color: "#39ff14" } : false} animate={{ scale: 1, color: row.completion_rate >= 90 ? "#39ff14" : row.completion_rate >= 70 ? "#ffff00" : t.text }} transition={{ type: "spring", stiffness: 200 }} className="font-mono text-sm">
          <RollingNumber value={row.completion_rate} decimals={2} />%
        </motion.span>
      </div>
      <div className="text-center flex items-center justify-center">
        <motion.span key={`${row.id}-${row.max_combo}`} initial={scoreChanged ? { scale: 1.3 } : false} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="font-mono text-sm" style={{ color: row.max_combo >= 500 ? t.secondary : t.text }}>
          <RollingNumber value={row.max_combo} />
        </motion.span>
      </div>
      <div className="text-center flex items-center justify-center">
        <motion.span key={`${row.id}-${row.perfect_count}`} initial={scoreChanged ? { scale: 1.3 } : false} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.05 }} className="font-mono text-sm" style={{ color: row.perfect_count >= 300 ? t.primary : t.text }}>
          <RollingNumber value={row.perfect_count} />
        </motion.span>
      </div>
    </motion.div>
  );
}
