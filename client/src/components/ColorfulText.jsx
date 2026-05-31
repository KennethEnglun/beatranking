import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";

export default function ColorfulText({ text }) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(
      "span",
      { filter: "blur(0px)", opacity: 1 },
      { delay: stagger(0.08) }
    );
  }, [animate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const spans = scope.current?.querySelectorAll("span");
      if (!spans) return;
      spans.forEach((span, i) => {
        setTimeout(() => {
          const hue = (Date.now() * 0.01 + i * 30) % 360;
          span.style.color = `hsl(${hue}, 90%, 60%)`;
          span.style.textShadow = `0 0 10px hsl(${hue}, 90%, 60%), 0 0 20px hsl(${hue}, 90%, 60%), 0 0 40px hsl(${hue}, 90%, 40%)`;
        }, i * 15);
      });
    }, 300);
    return () => clearInterval(interval);
  }, [scope]);

  return (
    <motion.span ref={scope}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ filter: "blur(4px)", opacity: 0 }}
          className="inline-block"
          style={{
            color: `hsl(${i * 30}, 90%, 60%)`,
            textShadow: `0 0 10px hsl(${i * 30}, 90%, 60%), 0 0 20px hsl(${i * 30}, 90%, 40%)`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
