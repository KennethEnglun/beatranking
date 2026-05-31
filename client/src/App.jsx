import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Leaderboard from "./components/Leaderboard";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import AnimatedBackground from "./components/AnimatedBackground";
import { checkAuth, adminLogout } from "./lib/api";

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.25 } },
};

const btnHover = { scale: 1.05, transition: { duration: 0.2 } };
const btnTap = { scale: 0.95 };

export default function App() {
  const [view, setView] = useState("leaderboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.98, 1.02, 0.98] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-neon-cyan text-2xl font-game"
        >
          載入中...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg relative">
      <AnimatedBackground />

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative z-10 border-b border-cyber-border bg-cyber-card/80 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <motion.h1
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="font-game text-sm sm:text-lg title-glow text-neon-magenta cursor-pointer"
            onClick={() => setView("leaderboard")}
          >
            李炳摘星之勁Beat大賽排行榜
          </motion.h1>
          <div className="flex gap-2">
            <NavBtn active={view === "leaderboard"} color="cyan" onClick={() => setView("leaderboard")}>
              排行榜
            </NavBtn>
            {isAdmin ? (
              <>
                <NavBtn active={view === "admin"} color="magenta" onClick={() => setView("admin")}>
                  管理面板
                </NavBtn>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 12px rgba(255,50,50,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded text-xs font-game border border-red-500/50 text-red-400 hover:text-red-300 transition-colors"
                >
                  登出
                </motion.button>
              </>
            ) : (
              <NavBtn active={view === "admin"} color="magenta" onClick={() => setView("admin")}>
                管理員
              </NavBtn>
            )}
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {view === "leaderboard" && <Leaderboard />}
            {view === "admin" && (
              isAdmin ? (
                <AdminPanel onLogout={handleLogout} />
              ) : (
                <AdminLogin onLogin={() => { setIsAdmin(true); setView("admin"); }} />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 border-t border-cyber-border py-3 text-center text-gray-600 text-xs"
      >
        <motion.span animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 3 }} className="text-neon-cyan/50">◆</motion.span>
        {" "}李炳摘星之勁Beat大賽排行榜{" "}
        <motion.span animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} className="text-neon-magenta/50">◆</motion.span>
      </motion.footer>
    </div>
  );
}

function NavBtn({ active, color, onClick, children }) {
  const colorMap = {
    cyan: { border: "border-neon-cyan", text: "text-neon-cyan", glow: "0 0 12px rgba(0,255,255,0.3)" },
    magenta: { border: "border-neon-magenta", text: "text-neon-magenta", glow: "0 0 12px rgba(255,0,255,0.3)" },
  };
  const c = colorMap[color];
  return (
    <motion.button
      whileHover={btnHover}
      whileTap={btnTap}
      onClick={onClick}
      className={`px-4 py-1.5 rounded text-xs font-game border transition-colors ${
        active ? `${c.border} ${c.text}` : "border-cyber-border text-gray-500 hover:text-gray-400"
      }`}
      style={active ? { boxShadow: c.glow } : {}}
    >
      {children}
    </motion.button>
  );
}
