import { createContext, useContext, useState, useCallback } from "react";

export const themes = {
  cyberpunk: {
    name: "螢光彩",
    bg: "#06060e",
    card: "rgba(13,13,31,0.9)",
    border: "#1a1a3e",
    primary: "#00ffff",
    secondary: "#ff00ff",
    accent: "#39ff14",
    yellow: "#ffff00",
    text: "#e0e0e0",
    muted: "#6b7280",
    headerBg: "rgba(13,13,31,0.8)",
    inputBg: "#06060e",
    particles: ["#00ffff", "#ff00ff", "#39ff14", "#ffff00"],
    borderRadius: "4px",
    font: '"Share Tech Mono", monospace',
    titleFont: '"Press Start 2P", monospace',
  },
  miku: {
    name: "初音風格",
    bg: "#0a1628",
    card: "rgba(13,31,60,0.9)",
    border: "#1a3550",
    primary: "#39c5bb",
    secondary: "#ff69b4",
    accent: "#00e5e5",
    yellow: "#ffb6c1",
    text: "#e8f4f8",
    muted: "#7b9db5",
    headerBg: "rgba(13,31,60,0.85)",
    inputBg: "#0d1f3c",
    particles: ["#39c5bb", "#ff69b4", "#00e5e5", "#ffb6c1", "#ff99cc"],
    borderRadius: "12px",
    font: '"M PLUS Rounded 1c", sans-serif',
    titleFont: '"M PLUS Rounded 1c", "Press Start 2P", sans-serif',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("cyberpunk");

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === "cyberpunk" ? "miku" : "cyberpunk"));
  }, []);

  const t = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggle, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
