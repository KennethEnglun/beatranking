import { useState, useEffect, useCallback } from "react";
import Leaderboard from "./components/Leaderboard";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import AnimatedBackground from "./components/AnimatedBackground";
import { checkAuth, adminLogout } from "./lib/api";

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
        <div className="text-neon-cyan text-2xl animate-pulse">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg relative">
      <AnimatedBackground />

      {/* 頂部導航 */}
      <header className="relative z-10 border-b border-cyber-border bg-cyber-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1
            className="font-game text-sm sm:text-lg title-glow text-neon-magenta cursor-pointer flex items-center gap-3"
            onClick={() => setView("leaderboard")}
          >
            <img src="/logo.png" alt="Logo" className="h-8 sm:h-10 w-auto" />
            勁Beat大賽排行榜
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView("leaderboard")}
              className={`px-4 py-1.5 rounded text-xs font-game border transition-all duration-300 ${
                view === "leaderboard"
                  ? "border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                  : "border-cyber-border text-gray-500 hover:border-neon-cyan/50 hover:text-neon-cyan/70"
              }`}
            >
              排行榜
            </button>
            {isAdmin ? (
              <>
                <button
                  onClick={() => setView("admin")}
                  className={`px-4 py-1.5 rounded text-xs font-game border transition-all duration-300 ${
                    view === "admin"
                      ? "border-neon-magenta text-neon-magenta shadow-[0_0_10px_rgba(255,0,255,0.3)]"
                      : "border-cyber-border text-gray-500 hover:border-neon-magenta/50 hover:text-neon-magenta/70"
                  }`}
                >
                  管理面板
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded text-xs font-game border border-red-500/50 text-red-400 hover:border-red-400 hover:text-red-300 transition-all duration-300"
                >
                  登出
                </button>
              </>
            ) : (
              <button
                onClick={() => setView("admin")}
                className={`px-4 py-1.5 rounded text-xs font-game border transition-all duration-300 ${
                  view === "admin"
                    ? "border-neon-magenta text-neon-magenta shadow-[0_0_10px_rgba(255,0,255,0.3)]"
                    : "border-cyber-border text-gray-500 hover:border-neon-magenta/50 hover:text-neon-magenta/70"
                }`}
              >
                管理員
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 主內容 */}
      <main className="relative z-10">
        {view === "leaderboard" && <Leaderboard />}
        {view === "admin" && (
          isAdmin ? (
            <AdminPanel onLogout={handleLogout} />
          ) : (
            <AdminLogin onLogin={() => { setIsAdmin(true); setView("admin"); }} />
          )
        )}
      </main>

      {/* 底部 */}
      <footer className="relative z-10 border-t border-cyber-border py-3 text-center text-gray-600 text-xs">
        <span className="text-neon-cyan/50">◆</span> 勁Beat大賽排行榜系統 <span className="text-neon-magenta/50">◆</span>
      </footer>
    </div>
  );
}
