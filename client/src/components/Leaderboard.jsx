import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchLeaderboard } from "../lib/api";
import RankRow from "./RankRow";

const GROUPS = [
  { key: "low", label: "低年級組", grades: "1-2年級", color: "neon-cyan", bg: "rgba(0,255,255,0.06)", shadow: "0 0 15px rgba(0,255,255,0.15)" },
  { key: "mid", label: "中年級組", grades: "3-4年級", color: "neon-magenta", bg: "rgba(255,0,255,0.06)", shadow: "0 0 15px rgba(255,0,255,0.15)" },
  { key: "high", label: "高年級組", grades: "5-6年級", color: "neon-green", bg: "rgba(57,255,20,0.06)", shadow: "0 0 15px rgba(57,255,20,0.15)" },
];

const ROTATION_INTERVAL = 5000;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const tableVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const tabVariants = {
  active: { scale: 1, y: 0 },
  inactive: { scale: 0.95, y: 2 },
};

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 py-6"
    >
      {/* 組別切換 */}
      <div className="flex justify-center flex-wrap gap-2 mb-2">
        {GROUPS.map((g) => (
          <motion.button
            key={g.key}
            variants={tabVariants}
            animate={group === g.key ? "active" : "inactive"}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setSelectedGroup(g.key); setRotating(false); }}
            className={`px-4 sm:px-6 py-2.5 rounded text-xs sm:text-sm font-game border-2 transition-colors ${
              group === g.key && !rotating
                ? `${colorMap[g.color].border} ${colorMap[g.color].text} ${colorMap[g.color].glow}`
                : "border-cyber-border text-gray-500 hover:border-gray-600"
            }`}
          >
            <div>{g.label}</div>
            <div className="text-[10px] mt-0.5 opacity-70">{g.grades}</div>
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setRotating(!rotating); if (!rotating) setRotationIdx(GROUPS.findIndex((g) => g.key === selectedGroup)); }}
          className={`px-4 sm:px-6 py-2.5 rounded text-xs sm:text-sm font-game border-2 transition-colors ${
            rotating
              ? "border-neon-yellow text-neon-yellow shadow-[0_0_15px_rgba(255,255,0,0.2)]"
              : "border-cyber-border text-gray-500 hover:border-neon-yellow/50 hover:text-neon-yellow/70"
          }`}
        >
          <motion.div
            animate={rotating ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            style={{ display: "inline-block" }}
          >
            🔄
          </motion.div>{" "}
          輪播
          <div className="text-[10px] mt-0.5 opacity-70">自動切換</div>
        </motion.button>
      </div>

      {/* 輪播進度條 */}
      <AnimatePresence>
        {rotating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-center mb-4 overflow-hidden"
          >
            <div className="flex items-center gap-3 bg-cyber-bg/80 rounded-full px-4 py-1.5 border border-neon-yellow/30">
              {GROUPS.map((g, i) => (
                <motion.div
                  key={g.key}
                  animate={{
                    scale: i === rotationIdx ? 1.3 : 0.8,
                    backgroundColor: i === rotationIdx ? 
                      (g.color === "neon-cyan" ? "#00ffff" : g.color === "neon-magenta" ? "#ff00ff" : "#39ff14") :
                      "rgb(75,85,99)",
                  }}
                  className="w-3 h-3 rounded-full"
                  style={{
                    boxShadow: i === rotationIdx ?
                      `0 0 8px ${g.color === "neon-cyan" ? "#00ffff" : g.color === "neon-magenta" ? "#ff00ff" : "#39ff14"}` :
                      "none",
                  }}
                />
              ))}
              <motion.span
                key={rotationIdx}
                initial={{ scale: 1.2, color: "#ffff00" }}
                animate={{ scale: 1, color: "#ffff00" }}
                className="text-[10px] font-mono text-neon-yellow ml-1"
              >
                {countdown.toFixed(1)}s
              </motion.span>
              <button onClick={stopRotating} className="text-[10px] text-gray-500 hover:text-neon-magenta transition-colors ml-1">
                ✕ 停止
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 排行榜表格 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={group}
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`bg-cyber-card/90 backdrop-blur-sm rounded-lg border ${activeColor.border} ${activeColor.glow} overflow-hidden`}
        >
          {/* 表頭 */}
          <div className="grid grid-cols-6 gap-2 px-4 py-3 bg-cyber-bg border-b border-cyber-border text-xs font-game text-gray-400">
            <div className="text-center">排名</div>
            <div>姓名</div>
            <div className="text-center">班級</div>
            <div className="text-center">完成率%</div>
            <div className="text-center">最大連擊</div>
            <div className="text-center">Perfect</div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && data.length === 0 ? (
              <div className="py-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="text-4xl mb-3 inline-block"
                >
                  🎮
                </motion.div>
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="font-game text-sm text-gray-500"
                >
                  載入中...
                </motion.div>
              </div>
            ) : data.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center text-gray-500"
              >
                <div className="text-4xl mb-3">📭</div>
                <div className="font-game text-sm">暫無數據</div>
                <div className="text-xs mt-1">請透過管理面板上載玩家及輸入分數</div>
              </motion.div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {data.map((row, i) => (
                  <RankRow key={row.id} row={row} index={i} prevData={prevDataRef.current} groupColor={activeGroup.color} />
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 更新時間 */}
      {lastUpdate && data.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-4 text-gray-600 text-xs"
        >
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="text-neon-cyan/50">●</motion.span>
          {" "}最後更新: {lastUpdate.toLocaleTimeString("zh-HK")}
          <span className="ml-2 text-neon-cyan/30 text-[10px]">(每8秒自動更新)</span>
        </motion.div>
      )}
    </motion.div>
  );
}
