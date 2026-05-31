import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadCsv, downloadPlayersCsv } from "../lib/api";

export default function CsvUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const res = await uploadCsv(file);
      if (res.success) {
        setResult({ success: true, text: `✅ 成功處理 ${res.processed}/${res.total} 位玩家` });
      } else {
        setResult({ success: false, error: res.error || "上載失敗" });
      }
    } catch {
      setResult({ success: false, error: "無法連接到伺服器" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h3
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-game text-sm text-neon-cyan mb-4 text-center"
      >
        📋 上載玩家名單 CSV
      </motion.h3>

      {/* 拖放區域 */}
      <motion.div
        whileHover={!file ? { scale: 1.02, borderColor: "rgba(0,255,255,0.5)" } : {}}
        animate={{
          borderColor: dragOver ? "#00ffff" : "rgba(26,26,62,1)",
          backgroundColor: dragOver ? "rgba(0,255,255,0.05)" : "rgba(0,0,0,0)",
          boxShadow: dragOver ? "0 0 20px rgba(0,255,255,0.15)" : "none",
          scale: dragOver ? 1.02 : 1,
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <motion.div
          animate={dragOver ? { y: -4 } : { y: 0 }}
          className="text-3xl mb-2"
        >
          📁
        </motion.div>
        {file ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-neon-cyan text-sm font-mono"
          >
            {file.name}
          </motion.div>
        ) : (
          <>
            <div className="text-gray-400 text-sm">拖放 CSV 檔案至此處，或點擊選取</div>
            <div className="text-gray-600 text-xs mt-1">接受 .csv 格式</div>
          </>
        )}
      </motion.div>

      <div className="text-xs text-gray-500 mb-4 bg-cyber-bg/50 rounded p-3 border border-cyber-border">
        <div className="text-neon-cyan/70 mb-1">CSV 欄位格式：</div>
        <code className="text-gray-400">年級,班別,學號,姓名</code>
        <div className="text-gray-600 mt-0.5">如：1,A,01,陳小明</div>
        <div className="text-gray-600 mt-0.5">支援中文或英文欄位名稱 (grade, class, student_number, name)</div>
      </div>

      <motion.button
        whileHover={file ? { scale: 1.02, boxShadow: "0 0 20px rgba(0,255,255,0.3)" } : {}}
        whileTap={file ? { scale: 0.97 } : {}}
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full py-2.5 rounded font-game text-xs border border-neon-cyan text-neon-cyan
          bg-neon-cyan/5 hover:bg-neon-cyan/15
          disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block"
            >
              ⏳
            </motion.span>
            上載中...
          </span>
        ) : "開始上載"}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(255,255,0,0.3)" }}
        whileTap={{ scale: 0.97 }}
        onClick={downloadPlayersCsv}
        className="w-full mt-3 py-2.5 rounded font-game text-xs border border-neon-yellow text-neon-yellow
          bg-neon-yellow/5 hover:bg-neon-yellow/15 transition-colors"
      >
        📥 下載現時玩家 CSV
      </motion.button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className={`mt-4 p-3 rounded text-xs text-center font-game border overflow-hidden ${
              result.success
                ? "border-neon-green/50 text-neon-green bg-neon-green/5"
                : "border-red-500/50 text-red-400 bg-red-900/10"
            }`}
          >
            {result.success ? result.text : `❌ ${result.error}`}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
