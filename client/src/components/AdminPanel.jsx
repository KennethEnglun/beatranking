import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CsvUploader from "./CsvUploader";
import ScoreEntry from "./ScoreEntry";

const tabContentVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState("scores");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto px-4 py-6"
    >
      <div className="text-center mb-6">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="font-game text-lg text-neon-magenta text-glow-magenta mb-1"
        >
          管理面板
        </motion.h2>
        <p className="text-gray-500 text-xs">上載玩家資料及輸入比賽分數</p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {[
          { key: "scores", label: "輸入分數", color: "magenta" },
          { key: "upload", label: "上載CSV", color: "cyan" },
        ].map(({ key, label, color }) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(key)}
            className={`px-6 py-2 rounded text-xs font-game border transition-colors ${
              tab === key
                ? `border-neon-${color} text-neon-${color} shadow-[0_0_12px_rgba(${color === "magenta" ? "255,0,255" : "0,255,255"},0.3)]`
                : "border-cyber-border text-gray-500 hover:border-gray-600"
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>

      <div className="bg-cyber-card/90 backdrop-blur-sm rounded-lg border border-neon-magenta/30 p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={tabContentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {tab === "scores" && <ScoreEntry />}
            {tab === "upload" && <CsvUploader />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
