import { useEffect, useRef } from "react";
import { useTheme } from "../lib/ThemeContext";

export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const { theme, t } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    if (theme === "cyberpunk") {
      const particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2.5 + 0.5,
        color: t.particles[Math.floor(Math.random() * t.particles.length)],
        alpha: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      }));

      const nodes = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, r: 60 },
        { x: canvas.width * 0.7, y: canvas.height * 0.2, r: 50 },
        { x: canvas.width * 0.5, y: canvas.height * 0.7, r: 70 },
        { x: canvas.width * 0.85, y: canvas.height * 0.6, r: 45 },
        { x: canvas.width * 0.15, y: canvas.height * 0.75, r: 55 },
      ];

      let frame = 0;
      function draw() {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * (0.7 + 0.3 * Math.sin(frame * 0.02 + p.pulse));
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
          for (let j = i + 1; j < particles.length; j++) {
            const dx = p.x - particles[j].x;
            const dy = p.y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(0,255,255,${0.06 * (1 - dist / 140)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
        nodes.forEach((n) => {
          const alpha = 0.02 + 0.01 * Math.sin(frame * 0.015 + n.x);
          const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
          gradient.addColorStop(0, `rgba(0,255,255,${alpha * 1.5})`);
          gradient.addColorStop(0.5, `rgba(255,0,255,${alpha})`);
          gradient.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        });
        animationId = requestAnimationFrame(draw);
      }
      draw();
    } else {
      // Miku 風格：粉紅花瓣 + 音樂符號
      const petals = [];
      for (let i = 0; i < 35; i++) {
        petals.push(createMikuPetal(canvas));
      }

      const notes = ["♪", "♫", "♬", "♩", "♭", "𝄞"];
      const floatingNotes = [];
      for (let i = 0; i < 12; i++) {
        floatingNotes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.3 - Math.random() * 0.5,
          text: notes[Math.floor(Math.random() * notes.length)],
          size: 12 + Math.random() * 16,
          alpha: 0.1 + Math.random() * 0.2,
          color: ["#39c5bb", "#ff69b4", "#00e5e5", "#ffb6c1"][Math.floor(Math.random() * 4)],
        });
      }

      let frame = 0;
      function drawMiku() {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        petals.forEach((p) => {
          p.x += p.vx + Math.sin(frame * 0.01 + p.offset) * 0.4;
          p.y += p.vy;
          p.rotation += p.rotSpeed;
          if (p.y > canvas.height + 20) {
            Object.assign(p, createMikuPetalData(canvas.width));
          }
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        });

        floatingNotes.forEach((n) => {
          n.y += n.vy;
          n.x += n.vx;
          if (n.y < -30) { n.y = canvas.height + 20; n.x = Math.random() * canvas.width; }
          if (n.x < -20) n.x = canvas.width + 10;
          if (n.x > canvas.width + 20) n.x = -10;
          ctx.globalAlpha = n.alpha * (0.7 + 0.3 * Math.sin(frame * 0.03 + n.x));
          ctx.font = `${n.size}px serif`;
          ctx.fillStyle = n.color;
          ctx.shadowBlur = 5;
          ctx.shadowColor = n.color;
          ctx.fillText(n.text, n.x, n.y);
          ctx.shadowBlur = 0;
        });

        // Wave lines at the bottom
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          const baseY = canvas.height - 15 - i * 12;
          ctx.moveTo(0, baseY);
          for (let x = 0; x < canvas.width; x += 10) {
            ctx.lineTo(x, baseY + Math.sin(x * 0.02 + frame * 0.02 + i) * 4);
          }
          ctx.strokeStyle = `rgba(57,197,187,${0.05 - i * 0.01})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        animationId = requestAnimationFrame(drawMiku);
      }
      drawMiku();
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [theme, t]);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            opacity: theme === "miku" ? 0.015 : 0.025,
            background: theme === "miku"
              ? "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(57,197,187,0.05) 3px, rgba(57,197,187,0.05) 6px)"
              : "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.08) 2px, rgba(0,255,255,0.08) 4px)",
          }}
        />
        {theme === "miku" && (
          <div
            className="absolute inset-0"
            style={{ opacity: 0.02, background: "radial-gradient(ellipse at 30% 20%, rgba(255,105,180,0.1) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(57,197,187,0.08) 0%, transparent 60%)" }}
          />
        )}
      </div>
    </>
  );
}

function createMikuPetalData(w) {
  return {
    x: Math.random() * w,
    y: -20 - Math.random() * 100,
    size: 2 + Math.random() * 5,
    vx: (Math.random() - 0.5) * 0.4,
    vy: 0.3 + Math.random() * 0.8,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.03,
    alpha: 0.2 + Math.random() * 0.35,
    color: ["#ff69b4", "#ffb6c1", "#ff99cc", "#ffccff", "#ffffff"][Math.floor(Math.random() * 5)],
    offset: Math.random() * Math.PI * 2,
  };
}

function createMikuPetal(canvas) {
  return createMikuPetalData(canvas.width);
}
