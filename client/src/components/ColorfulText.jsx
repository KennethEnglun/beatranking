import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { useTheme } from "../lib/ThemeContext";

export default function ColorfulText({ text }) {
  const [scope, animate] = useAnimate();
  const { theme } = useTheme();

  useEffect(() => {
    animate("span", { filter: "blur(0px)", opacity: 1 }, { delay: stagger(0.08) });
  }, [animate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const spans = scope.current?.querySelectorAll("span");
      if (!spans) return;
      spans.forEach((span, i) => {
        setTimeout(() => {
          const hue = (Date.now() * 0.01 + i * 30) % 360;
          const saturation = theme === "miku" ? "75%" : theme === "pokemon" ? "85%" : "90%";
          const lightness = theme === "miku" ? "70%" : theme === "pokemon" ? "55%" : "60%";
          span.style.color = `hsl(${hue}, ${saturation}, ${lightness})`;
          span.style.textShadow = `0 0 10px hsl(${hue}, ${saturation}, ${lightness}), 0 0 20px hsl(${hue}, ${saturation}, 50%), 0 0 35px hsl(${hue}, 80%, 35%)`;
        }, i * 15);
      });
    }, theme === "miku" ? 400 : theme === "pokemon" ? 350 : 300);
    return () => clearInterval(interval);
  }, [scope, theme]);

  return (
    <motion.span ref={scope}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ filter: "blur(4px)", opacity: 0 }}
          className="inline-block"
          style={{
            color: `hsl(${i * 30}, ${theme === "miku" ? "75%" : theme === "pokemon" ? "85%" : "90%"}, ${theme === "miku" ? "70%" : theme === "pokemon" ? "55%" : "60%"})`,
            textShadow: `0 0 10px hsl(${i * 30}, ${theme === "miku" ? "70%" : theme === "pokemon" ? "80%" : "90%"}, ${theme === "miku" ? "70%" : theme === "pokemon" ? "55%" : "60%"}),
              0 0 20px hsl(${i * 30}, ${theme === "miku" ? "70%" : theme === "pokemon" ? "80%" : "90%"}, 45%)`,
            fontFamily: theme === "miku" ? '"M PLUS Rounded 1c", sans-serif' : theme === "pokemon" ? '"Fredoka", sans-serif' : '"Press Start 2P", monospace',
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
