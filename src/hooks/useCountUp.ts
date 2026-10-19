"use client";

import { useEffect, useState } from "react";

type CountUpOptions = {
  duration?: number;
  enabled?: boolean;
  instant?: boolean;
};

/** Eased count-up. `instant` is the reduced-motion path. */
export function useCountUp(
  target: number,
  { duration = 1600, enabled = true, instant = false }: CountUpOptions = {},
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    if (instant) {
      const frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, enabled, instant]);

  return value;
}
