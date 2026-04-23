import { useEffect, useState } from 'react';

// Tween a displayed number from `from` → `to` over `duration` ms using rAF.
// easeOutCubic keeps the motion lively but settles smoothly.
export function useCountUp(to, { from = 0, duration = 900, decimals = 1 } = {}) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, duration]);

  return Number(value.toFixed(decimals));
}
