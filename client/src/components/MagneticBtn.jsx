import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function MagneticBtn({ children, className, style, ...props }) {
  const ref = useRef(null);
  const xTo = useRef(null);
  const yTo = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    xTo.current = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.3)" });
    yTo.current = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.3)" });

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
      xTo.current(x);
      yTo.current(y);
    };
    const onLeave = () => { xTo.current(0); yTo.current(0); };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ ...style, display: "inline-block" }} {...props}>
      {children}
    </div>
  );
}
