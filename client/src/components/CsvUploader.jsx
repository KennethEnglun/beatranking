import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadCsv, downloadPlayersCsv } from "../lib/api";
import { useTheme } from "../lib/ThemeContext";

export default function CsvUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { t } = useTheme();

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const res = await uploadCsv(file);
      if (res.success) setResult({ success: true, text: `✅ 成功處理 ${res.processed}/${res.total} 位玩家` });
      else setResult({ success: false, error: res.error || "上載失敗" });
    } catch {
      setResult({ success: false, error: "無法連接到伺服器" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <motion.h3 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-sm mb-4 text-center" style={{ fontFamily: t.titleFont, color: t.primary }}>
        📋 上載玩家名單 CSV
      </motion.h3>

      <motion.div
        whileHover={!file ? { scale: 1.02 } : {}}
        animate={{ borderColor: dragOver ? t.primary : t.border, backgroundColor: dragOver ? `${t.primary}08` : "transparent", boxShadow: dragOver ? `0 0 20px ${t.primary}20` : "none", scale: dragOver ? 1.02 : 1 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4"
        style={{ borderColor: t.border, borderRadius: t.borderRadius }}
      >
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
        <motion.div animate={dragOver ? { y: -4 } : { y: 0 }} className="text-3xl mb-2">📁</motion.div>
        {file ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-sm font-mono" style={{ color: t.primary }}>
            {file.name}
          </motion.div>
        ) : (
          <>
            <div className="text-sm" style={{ color: t.muted }}>拖放 CSV 檔案至此處，或點擊選取</div>
            <div className="text-xs mt-1" style={{ color: t.muted, opacity: 0.6 }}>接受 .csv 格式</div>
          </>
        )}
      </motion.div>

      <div className="text-xs mb-4 rounded p-3 border" style={{ background: `${t.bg}80`, borderColor: t.border, color: t.muted }}>
        <div className="mb-1" style={{ color: t.primary }}>CSV 欄位格式：</div>
        <code className="block" style={{ color: t.text }}>年級,班別,學號,姓名</code>
        <div className="mt-0.5" style={{ color: t.muted }}>如：1,A,01,陳小明</div>
        <div className="mt-0.5" style={{ color: t.muted }}>支援中文或英文欄位名稱 (grade, class, student_number, name)</div>
      </div>

      <motion.button
        whileHover={file ? { scale: 1.02, boxShadow: `0 0 20px ${t.primary}40` } : {}}
        whileTap={file ? { scale: 0.97 } : {}}
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full py-2.5 rounded text-xs border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ fontFamily: t.titleFont, borderColor: t.primary, color: t.primary, borderRadius: t.borderRadius, background: `${t.primary}08` }}
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>⏳</motion.span>
            上載中...
          </span>
        ) : "開始上載"}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02, boxShadow: `0 0 15px ${t.yellow}40` }}
        whileTap={{ scale: 0.97 }}
        onClick={downloadPlayersCsv}
        className="w-full mt-3 py-2.5 rounded text-xs border transition-colors"
        style={{ fontFamily: t.titleFont, borderColor: t.yellow, color: t.yellow, borderRadius: t.borderRadius, background: `${t.yellow}08` }}
      >
        📥 下載現時玩家 CSV
      </motion.button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mt-4 p-3 rounded text-xs text-center border overflow-hidden"
            style={{
              fontFamily: t.titleFont,
              borderRadius: t.borderRadius,
              borderColor: result.success ? `${t.accent}50` : "rgba(255,50,50,0.5)",
              color: result.success ? t.accent : "#ff6666",
              background: result.success ? `${t.accent}08` : "rgba(255,0,0,0.05)",
            }}
          >
            {result.success ? result.text : `❌ ${result.error}`}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
