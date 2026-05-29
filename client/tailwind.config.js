/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: "#00ffff",
          magenta: "#ff00ff",
          green: "#39ff14",
          yellow: "#ffff00",
          pink: "#ff69b4",
        },
        cyber: {
          bg: "#06060e",
          card: "#0d0d1f",
          border: "#1a1a3e",
        },
      },
      fontFamily: {
        game: ['"Press Start 2P"', "monospace"],
        mono: ['"Share Tech Mono"', "monospace"],
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        scanline: "scanline 8s linear infinite",
        float: "float 3s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 20px #00ffff",
          },
          "50%": {
            boxShadow: "0 0 10px #00ffff, 0 0 30px #00ffff, 0 0 50px #00ffff",
          },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
