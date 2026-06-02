import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function RollingNumber({ value, duration = 0.8, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration,
      ease: "power2.out",
      snap: { val: 1 },
      onUpdate: () => { if (ref.current) ref.current.innerText = Math.round(obj.val); },
    });
  }, [value, duration]);

  return <span ref={ref} className={className}>{value}</span>;
}
