import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function ConfettiEffect({ onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    const particles = Array.from({ length: 60 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 15 - 3,
      size: 3 + Math.random() * 8,
      color: ["#FFCB05", "#E3350D", "#00ffff", "#ff00ff", "#39ff14", "#ff69b4", "#39c5bb"][Math.floor(Math.random() * 7)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 15,
      gravity: 0.15 + Math.random() * 0.3,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    let animationId;
    const tl = gsap.timeline({ onComplete: () => { cancelAnimationFrame(animationId); onComplete?.(); } });

    particles.forEach((p, i) => {
      const dur = 1 + Math.random() * 1.5;
      tl.to(p, {
        x: p.x + p.vx * 60,
        y: p.y + 400 + Math.random() * 300,
        alpha: 0,
        rotation: p.rotation + (Math.random() - 0.5) * 720,
        duration: dur,
        ease: "power2.in",
        onUpdate: () => { p.vy += p.gravity; p.x += p.vx; p.y += p.vy; },
      }, 0);
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        if (p.alpha <= 0) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      });
      animationId = requestAnimationFrame(draw);
    }
    draw();

    return () => { tl.kill(); cancelAnimationFrame(animationId); };
  }, [onComplete]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}
