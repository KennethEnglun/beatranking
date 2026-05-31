import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CsvUploader from "./CsvUploader";
import ScoreEntry from "./ScoreEntry";
import DataManager from "./DataManager";
import { useTheme } from "../lib/ThemeContext";

const tabContentVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState("scores");
  const { t } = useTheme();

  const tabs = [
    { key: "scores", label: "輸入分數", color: t.secondary },
    { key: "upload", label: "上載CSV", color: t.primary },
    { key: "data", label: "數據管理", color: t.yellow },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 py-6"
    >
      <div className="text-center mb-6">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="text-lg mb-1"
          style={{ fontFamily: t.titleFont, color: t.secondary, textShadow: `0 0 14px ${t.secondary}` }}
        >
          管理面板
        </motion.h2>
        <p className="text-xs" style={{ color: t.muted }}>上載玩家資料及輸入比賽分數</p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {tabs.map(({ key, label, color }) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(key)}
            className="px-6 py-2 rounded text-xs border transition-colors"
            style={{
              borderColor: tab === key ? color : t.border,
              color: tab === key ? color : t.muted,
              fontFamily: t.titleFont,
              borderRadius: t.borderRadius,
              boxShadow: tab === key ? `0 0 12px ${color}30` : "none",
            }}
          >
            {label}
          </motion.button>
        ))}
      </div>

      <div className="backdrop-blur-sm rounded-lg border p-6 overflow-hidden" style={{ background: t.card, borderColor: t.secondary + "30", borderRadius: t.borderRadius }}>
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
            {tab === "data" && <DataManager />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
