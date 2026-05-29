import { useState } from "react";
import CsvUploader from "./CsvUploader";
import ScoreEntry from "./ScoreEntry";

export default function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState("scores");

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* 歡迎橫幅 */}
      <div className="text-center mb-6">
        <h2 className="font-game text-lg text-neon-magenta text-glow-magenta mb-1">管理面板</h2>
        <p className="text-gray-500 text-xs">上載玩家資料及輸入比賽分數</p>
      </div>

      {/* Tab 切換 */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setTab("scores")}
          className={`px-6 py-2 rounded text-xs font-game border transition-all duration-300 ${
            tab === "scores"
              ? "border-neon-magenta text-neon-magenta shadow-[0_0_10px_rgba(255,0,255,0.3)]"
              : "border-cyber-border text-gray-500 hover:border-gray-600"
          }`}
        >
          輸入分數
        </button>
        <button
          onClick={() => setTab("upload")}
          className={`px-6 py-2 rounded text-xs font-game border transition-all duration-300 ${
            tab === "upload"
              ? "border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]"
              : "border-cyber-border text-gray-500 hover:border-gray-600"
          }`}
        >
          上載CSV
        </button>
      </div>

      {/* 內容區 */}
      <div className="bg-cyber-card/90 backdrop-blur-sm rounded-lg border border-neon-magenta/30 p-6">
        {tab === "scores" && <ScoreEntry />}
        {tab === "upload" && <CsvUploader />}
      </div>
    </div>
  );
}
