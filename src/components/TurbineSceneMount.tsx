"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useMotionProfile } from "@/hooks/useMotionProfile";

const Scene = dynamic(() => import("@/components/TurbineScene"), {
  ssr: false,
  loading: () => <ScenePlaceholder />,
});

function ScenePlaceholder() {
  return (
    <div className="scene__placeholder" aria-hidden="true">
      <span className="scene__ring" />
      <span className="scene__spoke" />
      <span className="scene__spoke scene__spoke--two" />
      <span className="scene__spoke scene__spoke--three" />
    </div>
  );
}

/** Lazy 3D: desktop only, motion allowed, mounted near the viewport. */
export function TurbineSceneMount() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { ready, reduced, desktop } = useMotionProfile();

  useEffect(() => {
    if (!ready || !desktop || reduced) return;
    const element = frameRef.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setVisible(true));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ready, desktop, reduced]);

  return (
    <div className="scene" ref={frameRef} aria-hidden="true">
      {ready && desktop && !reduced && visible ? <Scene /> : <ScenePlaceholder />}
    </div>
  );
}
