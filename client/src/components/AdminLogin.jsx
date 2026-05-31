import { motion } from "framer-motion";
import { useState } from "react";
import { adminLogin } from "../lib/api";

const formVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const errorVariants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: { opacity: 1, height: "auto", marginBottom: 16, transition: { duration: 0.3 } },
};

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

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
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="bg-cyber-card/90 backdrop-blur-sm rounded-lg border border-neon-magenta p-8"
        style={{ boxShadow: "0 0 30px rgba(255,0,255,0.12)" }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.5 }}
            className="text-5xl mb-4"
          >
            🔐
          </motion.div>
          <h2 className="font-game text-lg text-neon-magenta text-glow-magenta mb-2">管理員登入</h2>
          <p className="text-gray-500 text-xs">請輸入管理員密碼</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div animate={shake ? { x: [0, -8, 8, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入密碼"
              className="w-full px-4 py-3 bg-cyber-bg border border-cyber-border rounded text-white text-sm font-mono
                focus:outline-none focus:border-neon-magenta placeholder-gray-600 transition-colors
                focus:shadow-[0_0_15px_rgba(255,0,255,0.2)]"
              autoFocus
            />
          </motion.div>

          <motion.div
            variants={errorVariants}
            initial="hidden"
            animate={error ? "visible" : "hidden"}
          >
            {error && (
              <div className="text-red-400 text-xs text-center border border-red-500/30 rounded py-2 bg-red-900/10">
                {error}
              </div>
            )}
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading || !password}
            whileHover={!loading && password ? { scale: 1.03, boxShadow: "0 0 25px rgba(255,0,255,0.4)" } : {}}
            whileTap={!loading && password ? { scale: 0.97 } : {}}
            className="w-full py-3 rounded font-game text-sm border-2 border-neon-magenta text-neon-magenta
              bg-neon-magenta/5 hover:bg-neon-magenta/15
              disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                驗證中...
              </motion.span>
            ) : "登入"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
