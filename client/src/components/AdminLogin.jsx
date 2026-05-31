import { motion } from "framer-motion";
import { useState } from "react";
import { adminLogin } from "../lib/api";
import { useTheme } from "../lib/ThemeContext";

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const { t, theme } = useTheme();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminLogin(password);
      if (res.success) {
        onLogin();
      } else {
        setError(res.error || "登入失敗");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError("無法連接到伺服器");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="backdrop-blur-sm rounded-lg border p-8"
        style={{ background: t.card, borderColor: t.secondary, borderRadius: t.borderRadius, boxShadow: `0 0 30px ${t.secondary}20` }}
      >
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-center mb-8">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.5 }} className="text-5xl mb-4">
            {theme === "miku" ? "🎤" : "🔐"}
          </motion.div>
          <h2 className="text-lg mb-2" style={{ fontFamily: t.titleFont, color: t.secondary, textShadow: `0 0 14px ${t.secondary}, 0 0 28px ${t.secondary}` }}>
            管理員登入
          </h2>
          <p className="text-xs" style={{ color: t.muted }}>請輸入管理員密碼</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div animate={shake ? { x: [0, -8, 8, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入密碼" autoFocus
              className="w-full px-4 py-3 rounded text-sm font-mono focus:outline-none transition-colors placeholder-gray-600"
              style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text, borderRadius: t.borderRadius }}
              onFocus={(e) => { e.target.style.borderColor = t.secondary; e.target.style.boxShadow = `0 0 10px ${t.secondary}20`; }}
              onBlur={(e) => { e.target.style.borderColor = t.border; e.target.style.boxShadow = "none"; }}
            />
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-red-400 text-xs text-center border rounded py-2" style={{ borderColor: "rgba(255,50,50,0.3)", background: "rgba(255,0,0,0.08)" }}>
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit" disabled={loading || !password}
            whileHover={!loading && password ? { scale: 1.03, boxShadow: `0 0 25px ${t.secondary}40` } : {}}
            whileTap={!loading && password ? { scale: 0.97 } : {}}
            className="w-full py-3 rounded text-sm border-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontFamily: t.titleFont, borderColor: t.secondary, color: t.secondary, borderRadius: t.borderRadius, background: `${t.secondary}08` }}
          >
            {loading ? (
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}>驗證中...</motion.span>
            ) : "登入"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
