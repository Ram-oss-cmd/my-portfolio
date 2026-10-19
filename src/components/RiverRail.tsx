"use client";

import { useEffect, useState } from "react";
import { stages } from "@/data/content";

/** Fixed river progress rail. Decorative — the header nav carries navigation. */
export function RiverRail() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);

      const mid = window.innerHeight * 0.55;
      let current = 0;
      stages.forEach((stage, index) => {
        const element = document.getElementById(stage.id);
        if (element && element.getBoundingClientRect().top <= mid) current = index;
      });
      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <aside className="river-rail" aria-hidden="true">
        <div className="river-rail__rail">
          <span className="river-rail__fill" style={{ transform: `scaleY(${progress})` }} />
          <span className="river-rail__dot" style={{ top: `${progress * 100}%` }} />
        </div>
        <ol className="river-rail__stages">
          {stages.map((stage, index) => (
            <li key={stage.id} className={index === active ? "is-active" : undefined}>
              {stage.index}
            </li>
          ))}
        </ol>
        <div className="river-rail__readout">
          <span className="river-rail__label">{stages[active].label}</span>
          <span className="river-rail__percent">
            {String(Math.round(progress * 100)).padStart(2, "0")}%
          </span>
        </div>
      </aside>
      <div className="top-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
    </>
  );
}
