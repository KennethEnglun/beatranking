import { useState, useRef } from "react";
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
      setResult({ success: true, count: res.imported });
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h3 className="font-game text-sm text-neon-cyan mb-4 text-center">📋 上載玩家名單 CSV</h3>

      {/* 拖放區域 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 mb-4 ${
          dragOver
            ? "border-neon-cyan bg-neon-cyan/5 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
            : "border-cyber-border hover:border-neon-cyan/50 hover:bg-cyber-border/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div className="text-3xl mb-2">📁</div>
        {file ? (
          <div className="text-neon-cyan text-sm font-mono">{file.name}</div>
        ) : (
          <>
            <div className="text-gray-400 text-sm">拖放 CSV 檔案至此處，或點擊選取</div>
            <div className="text-gray-600 text-xs mt-1">接受 .csv 格式</div>
          </>
        )}
      </div>

      {/* CSV 格式提示 */}
      <div className="text-xs text-gray-500 mb-4 bg-cyber-bg/50 rounded p-3 border border-cyber-border">
        <div className="text-neon-cyan/70 mb-1">CSV 欄位格式：</div>
        <code className="text-gray-400">年級,班別,學號,姓名</code>
        <div className="text-gray-600 mt-0.5">如：1,A,01,陳小明</div>
        <div className="text-gray-600 mt-0.5">支援中文或英文欄位名稱 (grade, class, student_number, name)</div>
      </div>

      {/* 上傳按鈕 */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full py-2.5 rounded font-game text-xs border border-neon-cyan text-neon-cyan
          bg-neon-cyan/5 hover:bg-neon-cyan/15 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]
          disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
      >
        {uploading ? "上載中..." : "開始上載"}
      </button>

      {/* 下載現時 CSV */}
      <button
        onClick={downloadPlayersCsv}
        className="w-full mt-3 py-2.5 rounded font-game text-xs border border-neon-yellow text-neon-yellow
          bg-neon-yellow/5 hover:bg-neon-yellow/15 hover:shadow-[0_0_15px_rgba(255,255,0,0.3)]
          transition-all duration-300"
      >
        📥 下載現時玩家 CSV
      </button>

      {/* 結果提示 */}
      {result && (
        <div className={`mt-4 p-3 rounded text-xs text-center font-game border ${
          result.success
            ? "border-neon-green/50 text-neon-green bg-neon-green/5"
            : "border-red-500/50 text-red-400 bg-red-900/10"
        }`}>
          {result.success
            ? `✅ 成功導入 ${result.count} 位玩家`
            : `❌ ${result.error}`}
        </div>
      )}
    </div>
  );
}
