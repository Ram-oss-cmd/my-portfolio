"use client";

import { useEffect, useState } from "react";
import { Gauge } from "@/components/Gauge";
import { useCountUp } from "@/hooks/useCountUp";
import { useMotionProfile } from "@/hooks/useMotionProfile";

type Phase = "loading" | "leaving" | "gone";

export function Preloader() {
  const { ready, reduced } = useMotionProfile();
  const [phase, setPhase] = useState<Phase>("loading");
  const value = useCountUp(0.99, {
    duration: 1800,
    enabled: ready,
    instant: reduced,
  });

  useEffect(() => {
    if (!ready) return;
    if (reduced) {
      const frame = requestAnimationFrame(() => setPhase("gone"));
      return () => cancelAnimationFrame(frame);
    }
    const leave = window.setTimeout(() => setPhase("leaving"), 1900);
    return () => window.clearTimeout(leave);
  }, [ready, reduced]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const gone = window.setTimeout(() => setPhase("gone"), 280);
    return () => window.clearTimeout(gone);
  }, [phase]);

  useEffect(() => {
    if (phase === "gone") return;
    const root = document.documentElement;
    root.classList.add("is-preloading");
    return () => root.classList.remove("is-preloading");
  }, [phase]);

  if (phase === "gone") return null;

  const skip = () => setPhase("leaving");

  return (
    <div
      className={`preloader ${phase === "leaving" ? "preloader--leaving" : ""}`}
      aria-label="Plant start-up"
    >
      <div className="preloader__grid" aria-hidden="true" />
      <p className="sr-only" role="status">
        Loading the plant.
      </p>

      <div className="preloader__inner">
        <p className="preloader__kicker">
          <span>SELANG SHP</span>
          <span>NIGHT SHIFT / START-UP</span>
        </p>

        <Gauge
          label="Generator output"
          code="GEN-01"
          fraction={value / 1.2}
          readout={value.toFixed(3)}
          unit="MW"
          status="CLIMBING TO RATED"
          className="gauge--hero"
        />

        <div className="preloader__bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.min(1, value / 0.99)})` }} />
        </div>

        <div className="preloader__foot">
          <span>INTAKE → PENSTOCK → TURBINE</span>
          <button type="button" className="btn btn--ghost btn--small" onClick={skip}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
