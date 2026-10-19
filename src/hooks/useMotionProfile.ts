"use client";

import { useEffect, useState } from "react";

type MotionProfile = {
  ready: boolean;
  reduced: boolean;
  desktop: boolean;
};

/**
 * SSR renders the static, reduced version. After mount we can enable pinned
 * scroll scenes on wide screens with motion allowed.
 */
export function useMotionProfile(): MotionProfile {
  const [profile, setProfile] = useState<MotionProfile>({
    ready: false,
    reduced: true,
    desktop: false,
  });

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    const update = () =>
      setProfile({
        ready: true,
        reduced: motionQuery.matches,
        desktop: desktopQuery.matches,
      });

    update();
    motionQuery.addEventListener("change", update);
    desktopQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      desktopQuery.removeEventListener("change", update);
    };
  }, []);

  return profile;
}
