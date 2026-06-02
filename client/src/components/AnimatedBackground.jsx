import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useTheme } from "../lib/ThemeContext";

export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const { theme, t } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const mouseTrail = { particles: [] };
    const explosions = [];
    let mouseX = -100, mouseY = -100;
    let frame = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener("mousemove", handleMouse);

    function spawnMouseParticle() {
      if (mouseX < 0 || mouseY < 0) return;
      mouseTrail.particles.push({
        x: mouseX + (Math.random() - 0.5) * 30,
        y: mouseY + (Math.random() - 0.5) * 30,
        size: 1 + Math.random() * 2.5,
        alpha: 1,
        color: t.particles[Math.floor(Math.random() * t.particles.length)],
      });
      if (mouseTrail.particles.length > 30) mouseTrail.particles.shift();
    }

    function spawnExplosion() {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      const count = 15 + Math.floor(Math.random() * 15);
      const particles = Array.from({ length: count }, () => ({
        x: cx, y: cy,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 80,
        alpha: 1,
        color: t.particles[Math.floor(Math.random() * t.particles.length)],
        size: 2 + Math.random() * 4,
      }));
      const obj = { particles };
      gsap.to(obj.particles, {
        x: obj.particles.map(() => cx + (Math.random() - 0.5) * 300),
        y: obj.particles.map(() => cy + (Math.random() - 0.5) * 300),
        alpha: 0,
        duration: 1.5 + Math.random(),
        ease: "power2.out",
      });
      explosions.push(obj);
    }

    const explosionTimer = setInterval(spawnExplosion, 5000);
    const mouseTimer = setInterval(spawnMouseParticle, 60);

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

      const drawFn = () => {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * (0.7 + 0.3 * Math.sin(frame * 0.02 + p.pulse));
          ctx.shadowBlur = 6; ctx.shadowColor = p.color;
          ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;

          for (let j = i + 1; j < particles.length; j++) {
            const dx = p.x - particles[j].x; const dy = p.y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(0,255,255,${0.06 * (1 - dist / 140)})`;
              ctx.lineWidth = 0.5; ctx.stroke();
            }
          }
        });

        nodes.forEach((n) => {
          const alpha = 0.02 + 0.01 * Math.sin(frame * 0.015 + n.x);
          const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
          gradient.addColorStop(0, `rgba(0,255,255,${alpha * 1.5})`);
          gradient.addColorStop(0.5, `rgba(255,0,255,${alpha})`);
          gradient.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = gradient; ctx.fill();
        });

        drawCommon();
      };
      gsap.ticker.add(drawFn);

      return () => {
        gsap.ticker.remove(drawFn);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", handleMouse);
        clearInterval(explosionTimer);
        clearInterval(mouseTimer);
      };
    } else if (theme === "miku") {
      const petals = Array.from({ length: 35 }, () => createMikuPetalData(canvas.width));
      const notes = ["♪", "♫", "♬", "♩", "♭", "𝄞"];
      const floatingNotes = Array.from({ length: 12 }, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3, vy: -0.3 - Math.random() * 0.5,
        text: notes[Math.floor(Math.random() * notes.length)],
        size: 12 + Math.random() * 16, alpha: 0.1 + Math.random() * 0.2,
        color: ["#39c5bb", "#ff69b4", "#00e5e5", "#ffb6c1"][Math.floor(Math.random() * 4)],
      }));

      const drawFn = () => {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        petals.forEach((p) => {
          p.x += p.vx + Math.sin(frame * 0.01 + p.offset) * 0.4; p.y += p.vy; p.rotation += p.rotSpeed;
          if (p.y > canvas.height + 20) Object.assign(p, createMikuPetalData(canvas.width));
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.globalAlpha = p.alpha;
          ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fillStyle = p.color; ctx.shadowBlur = 8; ctx.shadowColor = p.color; ctx.fill(); ctx.shadowBlur = 0;
          ctx.restore();
        });

        floatingNotes.forEach((n) => {
          n.y += n.vy; n.x += n.vx;
          if (n.y < -30) { n.y = canvas.height + 20; n.x = Math.random() * canvas.width; }
          if (n.x < -20) n.x = canvas.width + 10; if (n.x > canvas.width + 20) n.x = -10;
          ctx.globalAlpha = n.alpha * (0.7 + 0.3 * Math.sin(frame * 0.03 + n.x));
          ctx.font = `${n.size}px serif`; ctx.fillStyle = n.color;
          ctx.shadowBlur = 5; ctx.shadowColor = n.color; ctx.fillText(n.text, n.x, n.y); ctx.shadowBlur = 0;
        });

        for (let i = 0; i < 3; i++) {
          ctx.beginPath(); const baseY = canvas.height - 15 - i * 12;
          ctx.moveTo(0, baseY);
          for (let x = 0; x < canvas.width; x += 10) ctx.lineTo(x, baseY + Math.sin(x * 0.02 + frame * 0.02 + i) * 4);
          ctx.strokeStyle = `rgba(57,197,187,${0.05 - i * 0.01})`; ctx.lineWidth = 1; ctx.stroke();
        }
        drawCommon();
      };
      gsap.ticker.add(drawFn);

      return () => {
        gsap.ticker.remove(drawFn);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", handleMouse);
        clearInterval(explosionTimer);
        clearInterval(mouseTimer);
      };
    } else {
      const pokeballs = Array.from({ length: 15 }, () => ({
        x: Math.random() * canvas.width, y: -50 - Math.random() * 200,
        size: 6 + Math.random() * 10, vx: (Math.random() - 0.5) * 0.2, vy: 0.3 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.02, alpha: 0.08 + Math.random() * 0.12,
      }));
      const stars = Array.from({ length: 25 }, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        size: 2 + Math.random() * 4, vy: -0.15 - Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.2,
        twinkle: Math.random() * Math.PI * 2, alpha: 0.15 + Math.random() * 0.35,
      }));
      let lightning = null;
      let lightningTimer = 0;

      const drawFn = () => {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pokeballs.forEach((b) => {
          b.y += b.vy; b.x += b.vx; b.rotation += b.rotSpeed;
          if (b.y > canvas.height + 30) { b.y = -30 - Math.random() * 100; b.x = Math.random() * canvas.width; }
          if (b.x < -20) b.x = canvas.width + 10; if (b.x > canvas.width + 20) b.x = -10;
          ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rotation); ctx.globalAlpha = b.alpha;
          ctx.beginPath(); ctx.arc(0, 0, b.size, Math.PI, 0); ctx.fillStyle = "#E3350D"; ctx.fill();
          ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI); ctx.fillStyle = "#ffffff"; ctx.fill();
          ctx.beginPath(); ctx.moveTo(-b.size, 0); ctx.lineTo(b.size, 0); ctx.strokeStyle = "#333"; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, b.size * 0.28, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#333"; ctx.lineWidth = 1; ctx.fill(); ctx.stroke();
          ctx.restore();
        });

        stars.forEach((s) => {
          s.y += s.vy; s.x += s.vx + Math.sin(frame * 0.02 + s.twinkle) * 0.15;
          if (s.y < -20) { s.y = canvas.height + 20; s.x = Math.random() * canvas.width; }
          if (s.x < -20) s.x = canvas.width + 10; if (s.x > canvas.width + 20) s.x = -10;
          const ta = s.alpha * (0.5 + 0.5 * Math.sin(frame * 0.06 + s.twinkle));
          ctx.globalAlpha = ta; ctx.save(); ctx.translate(s.x, s.y);
          ctx.beginPath();
          for (let i = 0; i < 5; i++) { const a = (i * 4 * Math.PI) / 5 - Math.PI / 2; const r = i % 2 === 0 ? s.size : s.size * 0.45; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
          ctx.closePath(); ctx.fillStyle = "#FFCB05"; ctx.shadowBlur = 6; ctx.shadowColor = "#FFCB05"; ctx.fill(); ctx.shadowBlur = 0; ctx.restore(); ctx.globalAlpha = 1;
        });

        if (!lightning && Math.random() < 0.008) {
          lightning = { x: Math.random() * canvas.width, y: 0, alpha: 0.8, segments: [] };
          let lx = lightning.x, ly = 0;
          for (let i = 0; i < 4 + Math.floor(Math.random() * 6); i++) { lx += (Math.random() - 0.5) * 40; ly += 20 + Math.random() * 30; lightning.segments.push({ x: lx, y: ly }); }
          lightningTimer = 6;
        }
        if (lightning) {
          ctx.globalAlpha = lightning.alpha; ctx.strokeStyle = "#FFCB05"; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = "#FFCB05";
          ctx.beginPath(); ctx.moveTo(lightning.x, 0); lightning.segments.forEach((seg) => ctx.lineTo(seg.x, seg.y)); ctx.stroke();
          ctx.beginPath(); const last = lightning.segments[lightning.segments.length - 1]; ctx.arc(last.x, last.y, 4, 0, Math.PI * 2); ctx.fillStyle = "#FFCB05"; ctx.fill();
          ctx.shadowBlur = 0; ctx.globalAlpha = 1; lightningTimer--; if (lightningTimer <= 0) lightning = null;
        }
        for (let i = 0; i < 3; i++) {
          ctx.beginPath(); const baseY = canvas.height - 10 - i * 8; ctx.moveTo(0, baseY);
          for (let x = 0; x < canvas.width; x += 8) ctx.lineTo(x, baseY + Math.sin(x * 0.03 + frame * 0.015 + i) * 3);
          ctx.strokeStyle = `rgba(42,117,187,${0.06 - i * 0.015})`; ctx.lineWidth = 1.5; ctx.stroke();
        }
        drawCommon();
      };
      gsap.ticker.add(drawFn);

      return () => {
        gsap.ticker.remove(drawFn);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", handleMouse);
        clearInterval(explosionTimer);
        clearInterval(mouseTimer);
      };
    }

    function drawCommon() {
      // Mouse trail
      mouseTrail.particles.forEach((p) => {
        p.alpha *= 0.92; p.size *= 0.98;
        if (p.alpha < 0.02) return;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 4; ctx.shadowColor = p.color;
        ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      });

      // Explosions
      explosions.forEach((exp) => {
        exp.particles.forEach((p) => {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.shadowBlur = 4; ctx.shadowColor = p.color;
          ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        });
      });
    }
  }, [theme, t]);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0" style={{ opacity: theme === "miku" ? 0.015 : theme === "pokemon" ? 0.012 : 0.025,
          background: theme === "miku"
            ? "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(57,197,187,0.05) 3px, rgba(57,197,187,0.05) 6px)"
            : theme === "pokemon"
            ? "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,203,5,0.04) 4px, rgba(255,203,5,0.04) 8px)"
            : "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.08) 2px, rgba(0,255,255,0.08) 4px)" }} />
        {theme === "miku" && <div className="absolute inset-0" style={{ opacity: 0.02, background: "radial-gradient(ellipse at 30% 20%, rgba(255,105,180,0.1) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(57,197,187,0.08) 0%, transparent 60%)" }} />}
        {theme === "pokemon" && <div className="absolute inset-0" style={{ opacity: 0.025, background: "radial-gradient(ellipse at 50% 30%, rgba(255,203,5,0.06) 0%, transparent 70%), radial-gradient(ellipse at 20% 70%, rgba(227,53,13,0.04) 0%, transparent 60%)" }} />}
      </div>
    </>
  );
}

function createMikuPetalData(w) {
  return { x: Math.random() * w, y: -20 - Math.random() * 100, size: 2 + Math.random() * 5,
    vx: (Math.random() - 0.5) * 0.4, vy: 0.3 + Math.random() * 0.8,
    rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.03,
    alpha: 0.2 + Math.random() * 0.35,
    color: ["#ff69b4", "#ffb6c1", "#ff99cc", "#ffccff", "#ffffff"][Math.floor(Math.random() * 5)],
    offset: Math.random() * Math.PI * 2 };
}
