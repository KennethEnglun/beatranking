import { useState } from "react";
import { adminLogin } from "../lib/api";

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      }
    } catch {
      setError("無法連接到伺服器");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-cyber-card/90 backdrop-blur-sm rounded-lg border border-neon-magenta shadow-[0_0_20px_rgba(255,0,255,0.15)] p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="font-game text-lg text-neon-magenta text-glow-magenta mb-2">管理員登入</h2>
          <p className="text-gray-500 text-xs">請輸入管理員密碼</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入密碼"
              className="w-full px-4 py-3 bg-cyber-bg border border-cyber-border rounded text-white text-sm font-mono
                focus:outline-none focus:border-neon-magenta focus:shadow-[0_0_10px_rgba(255,0,255,0.2)]
                placeholder-gray-600 transition-all duration-300"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center border border-red-500/30 rounded py-2 bg-red-900/10">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded font-game text-sm border-2 border-neon-magenta text-neon-magenta
              bg-neon-magenta/5 hover:bg-neon-magenta/15 hover:shadow-[0_0_20px_rgba(255,0,255,0.3)]
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-300"
          >
            {loading ? "驗證中..." : "登入"}
          </button>
        </form>
      </div>
    </div>
  );
}
