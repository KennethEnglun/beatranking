import { useRef, useEffect } from "react";
import gsap from "gsap";

function formatNumber(val, decimals) {
  if (decimals > 0) {
    const fixed = val.toFixed(decimals);
    return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
  }
  return Math.round(val).toString();
}

export default function RollingNumber({ value, duration = 0.8, decimals = 0, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration,
      ease: "power2.out",
      onUpdate: () => { if (ref.current) ref.current.innerText = formatNumber(obj.val, decimals); },
    });
  }, [value, duration, decimals]);

  return <span ref={ref} className={className}>{formatNumber(value, decimals)}</span>;
}
