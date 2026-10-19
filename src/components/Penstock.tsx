"use client";

import { useEffect, useRef } from "react";
import { Gauge } from "@/components/Gauge";
import { about, skills } from "@/data/content";
import { useMotionProfile } from "@/hooks/useMotionProfile";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function Penstock() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ready, reduced, desktop } = useMotionProfile();
  const pinned = ready && desktop && !reduced;

  useEffect(() => {
    if (!pinned) return;
    const section = sectionRef.current;
    const scroller = scrollRef.current;
    if (!section || !scroller) return;

    const copy = section.querySelectorAll<HTMLElement>(".penstock__copy > *");
    const tween = gsap.fromTo(
      copy,
      { y: 18 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        ease: "none",
        scrollTrigger: {
          trigger: scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      },
    );

    ScrollTrigger.refresh();

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [pinned]);

  return (
    <section
      id="penstock"
      ref={sectionRef}
      className={`stage penstock ${pinned ? "is-pinned" : ""}`}
      aria-labelledby="penstock-title"
    >
      <div className="shell">
        <header className="stage-head" data-reveal>
          <p className="stage-kicker">
            <span>STAGE 02 / PENSTOCK</span>
            <span>PRESSURE BUILDS</span>
          </p>
          <h2 id="penstock-title" className="stage-title">
            Penstock<span className="accent">.</span>
          </h2>
          <p className="stage-sub">
            A pipe, a drop, and a lot of pressure doing the work. This is the
            short version of me.
          </p>
        </header>
      </div>

      <div className="shell penstock__scroll" ref={scrollRef}>
        <div className="penstock__sticky">
          <div className="penstock__grid">
            <div className="penstock__copy">
              <p className="penstock__lead">{about.lead}</p>
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="penstock__para">
                  {paragraph}
                </p>
              ))}
              <p className="penstock__sig">
                <span className="label">SIGNED</span>
                Shreeram / Nepal
              </p>
            </div>

            <div className="penstock__skills">
              <div className="penstock__skills-head">
                <span className="label">CONTROL PANEL / SKILLS</span>
                <span className="penstock__skills-status">ALL IN SERVICE</span>
              </div>
              <div className="gauge-grid">
                {skills.map((skill) => (
                  <Gauge
                    key={skill.code}
                    code={skill.code}
                    label={skill.name}
                    fraction={0.72}
                    readout="—"
                    status={skill.status}
                  />
                ))}
              </div>
              <p className="penstock__note">
                Gauges show qualitative state, not invented scores. The learning
                list lives in the Workbench.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
