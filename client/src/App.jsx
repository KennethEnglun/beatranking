import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Leaderboard from "./components/Leaderboard";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import AnimatedBackground from "./components/AnimatedBackground";
import ColorfulText from "./components/ColorfulText";
import { useTheme } from "./lib/ThemeContext";
import { checkAuth, adminLogout } from "./lib/api";

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.25 } },
};

export default function App() {
  const [view, setView] = useState("leaderboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme, toggle, t } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    checkAuth()
      .then((data) => setIsAdmin(data.authenticated))
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = useCallback(async () => {
    await adminLogout();
    setIsAdmin(false);
    setView("leaderboard");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.98, 1.02, 0.98] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-2xl font-game" style={{ color: t.primary }}
        >
          載入中...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: t.bg, fontFamily: t.font }}>
      <AnimatedBackground />

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative z-10 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${t.border}`, background: t.headerBg }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <motion.h1
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="font-game text-sm sm:text-lg cursor-pointer"
            onClick={() => setView("leaderboard")}
          >
            <ColorfulText text="李炳摘星之勁Beat大賽排行榜" />
          </motion.h1>
          <div className="flex items-center gap-2">
            <ThemeToggleBtn theme={theme} onToggle={toggle} t={t} />
            <NavBtn active={view === "leaderboard"} color="primary" t={t} onClick={() => setView("leaderboard")}>
              排行榜
            </NavBtn>
            {isAdmin ? (
              <>
                <NavBtn active={view === "admin"} color="secondary" t={t} onClick={() => setView("admin")}>
                  管理面板
                </NavBtn>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded text-xs border transition-colors"
                  style={{
                    fontFamily: t.titleFont,
                    borderColor: "rgba(255,50,50,0.5)",
                    color: "#ff6666",
                    borderRadius: t.borderRadius,
                  }}
                >
                  登出
                </motion.button>
              </>
            ) : (
              <NavBtn active={view === "admin"} color="secondary" t={t} onClick={() => setView("admin")}>
                管理員
              </NavBtn>
            )}
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key={view} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {view === "leaderboard" && <Leaderboard />}
            {view === "admin" && (
              isAdmin ? <AdminPanel onLogout={handleLogout} /> : <AdminLogin onLogin={() => { setIsAdmin(true); setView("admin"); }} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 py-3 text-center text-xs"
        style={{ borderTop: `1px solid ${t.border}`, color: t.muted }}
      >
        <motion.span animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 3 }} style={{ color: t.primary }}>
          {theme === "miku" ? "♪" : "◆"}
        </motion.span>
        {" "}李炳摘星之勁Beat大賽排行榜{" "}
        <motion.span animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} style={{ color: t.secondary }}>
          {theme === "miku" ? "♫" : "◆"}
        </motion.span>
      </motion.footer>
    </div>
  );
}

function ThemeToggleBtn({ theme, onToggle, t }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.9, rotate: -15 }}
      onClick={onToggle}
      className="px-2 py-1.5 rounded text-xs border transition-colors font-game"
      style={{
        borderColor: theme === "miku" ? "#39c5bb" : t.border,
        color: theme === "miku" ? "#39c5bb" : t.muted,
        background: theme === "miku" ? "rgba(57,197,187,0.08)" : "transparent",
        borderRadius: t.borderRadius,
        boxShadow: theme === "miku" ? "0 0 10px rgba(57,197,187,0.2)" : "none",
      }}
      title={theme === "cyberpunk" ? "切換到初音風格" : "切換到螢光風格"}
    >
      {theme === "cyberpunk" ? "🌸" : "💜"}
    </motion.button>
  );
}

function NavBtn({ active, color, t, onClick, children }) {
  const c = {
    primary: { border: color === "primary" ? t.primary : t.border, text: t.primary, glow: t.primary },
    secondary: { border: color === "secondary" ? t.secondary : t.border, text: t.secondary, glow: t.secondary },
  };
  const style = c[color] || c.primary;
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-4 py-1.5 rounded text-xs border transition-colors"
      style={{
        borderColor: active ? style.border : t.border,
        color: active ? style.text : t.muted,
        fontFamily: t.titleFont,
        borderRadius: t.borderRadius,
        boxShadow: active ? `0 0 12px ${style.glow}40` : "none",
      }}
    >
      {children}
    </motion.button>
  );
}
