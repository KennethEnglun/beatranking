import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function GlitchText({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer;
    function triggerGlitch() {
      const tl = gsap.timeline();
      const x = (Math.random() - 0.5) * 8;
      const y = (Math.random() - 0.5) * 3;
      tl.to(el, { x: x, y: y, duration: 0.04 });
      tl.to(el, { x: -x * 1.5, y: -y, duration: 0.04 });
      tl.to(el, { x: x * 0.5, y: y * 0.5, duration: 0.04 });
      tl.to(el, { x: 0, y: 0, duration: 0.06, ease: "power2.out" });
      timer = setTimeout(triggerGlitch, 4000 + Math.random() * 6000);
    }
    timer = setTimeout(triggerGlitch, 3000 + Math.random() * 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span ref={ref} className={`inline-block relative ${className}`} style={{ transformStyle: "preserve-3d" }}>
      {children}
    </span>
  );
}
