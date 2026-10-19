"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotionProfile } from "@/hooks/useMotionProfile";

/** Lenis driven by the GSAP ticker, plus one-shot reveal batches. */
export function SmoothScroll() {
  const { ready, reduced } = useMotionProfile();

  useEffect(() => {
    if (!ready) return;

    const root = document.documentElement;

    if (reduced) {
      root.classList.remove("motion-ready");
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((element) => element.classList.add("is-in"));
      return;
    }

    root.classList.add("motion-ready");

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      anchors: { offset: -72 },
      respectReducedMotion: true,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const reveals = ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%",
      once: true,
      onEnter: (elements) => elements.forEach((element) => element.classList.add("is-in")),
    });

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 700);

    return () => {
      window.clearTimeout(refreshTimer);
      reveals.forEach((trigger) => trigger.kill());
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      root.classList.remove("motion-ready");
    };
  }, [ready, reduced]);

  return null;
}
