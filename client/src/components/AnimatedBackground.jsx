import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

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

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2.5 + 0.5,
      color: ["#00ffff", "#ff00ff", "#39ff14", "#ffff00"][Math.floor(Math.random() * 4)],
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

        const pulseAlpha = p.alpha * (0.7 + 0.3 * Math.sin(frame * 0.02 + p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pulseAlpha;
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

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.08) 2px, rgba(0,255,255,0.08) 4px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            background: "repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,0,255,0.05) 50px, rgba(255,0,255,0.05) 51px)",
          }}
        />
      </div>
    </>
  );
}
