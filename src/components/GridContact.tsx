"use client";

import { useEffect, useState } from "react";
import { ContactForm } from "@/components/ContactForm";
import { contact, site } from "@/data/content";
import { useCountUp } from "@/hooks/useCountUp";
import { useInView } from "@/hooks/useInView";
import { useMotionProfile } from "@/hooks/useMotionProfile";

export function GridContact() {
  const { ref, inView } = useInView<HTMLDivElement>("0px", 0.25);
  const { reduced } = useMotionProfile();
  const output = useCountUp(site.plantOutputMw, {
    duration: 1800,
    enabled: inView,
    instant: reduced,
  });
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyEmail = async () => {
    setNotice("");
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
    } catch {
      setNotice("Copy failed. Select the address and copy it manually.");
    }
  };

  const placeholder = (label: string) => {
    setNotice(`${label} is a placeholder. Add the real link in src/data/content.ts.`);
  };

  const percent = Math.min(100, (output / 1.2) * 100);

  return (
    <section id="grid" className="stage grid" aria-labelledby="grid-title">
      <div className="shell">
        <header className="stage-head" data-reveal>
          <p className="stage-kicker">
            <span>STAGE 06 / GRID</span>
            <span>POWER DELIVERED</span>
          </p>
          <h2 id="grid-title" className="stage-title">
            Power delivered<span className="accent">.</span> Let&apos;s talk.
          </h2>
        </header>

        <div className="grid__layout">
          <div className="grid__left" ref={ref}>
            <div
              className="meter"
              role="meter"
              aria-label="Plant output in megawatts"
              aria-valuemin={0}
              aria-valuemax={1.2}
              aria-valuenow={Number(output.toFixed(3))}
            >
              <div className="meter__head">
                <span className="label">GENERATOR OUTPUT / GEN-01</span>
                <span className="meter__status">
                  <span className="status-dot" /> ON GRID
                </span>
              </div>
              <p className="meter__value">
                {output.toFixed(3)}
                <span className="meter__unit">MW</span>
              </p>
              <div className="meter__track" aria-hidden="true">
                <span className="meter__fill" style={{ width: `${percent}%` }} />
                {Array.from({ length: 24 }, (_, index) => (
                  <span
                    key={index}
                    className="meter__tick"
                    style={{ left: `${(index / 23) * 100}%` }}
                  />
                ))}
              </div>
              <div className="meter__scale" aria-hidden="true">
                <span>0.000</span>
                <span>0.990 RATED</span>
                <span>1.200</span>
              </div>
            </div>

            <p className="grid__blurb">{contact.blurb}</p>

            <div className="contact-links">
              <a className="btn btn--amber" href={`mailto:${contact.email}`}>
                Email
              </a>
              <button type="button" className="btn btn--ghost" onClick={copyEmail}>
                {copied ? "Copied" : "Copy email"}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => placeholder("LinkedIn")}
              >
                LinkedIn <span className="btn__placeholder">PLACEHOLDER</span>
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => placeholder("The CV download")}
              >
                Download CV <span className="btn__placeholder">PLACEHOLDER</span>
              </button>
            </div>

            <p className="contact-links__email">
              <span className="label">EMAIL</span>
              <span>{contact.email}</span>
              {contact.emailIsPlaceholder ? (
                <span className="tag tag--amber">PLACEHOLDER ADDRESS</span>
              ) : null}
            </p>

            <p className="contact-links__notice" role="status" aria-live="polite">
              {notice}
            </p>
          </div>

          <div className="grid__right" data-reveal>
            <ContactForm />
          </div>
        </div>

        <footer className="site-footer">
          <p>
            <span className="label">SIGNAL</span>
            {site.name} / {site.location} / NPT
          </p>
          <p>
            <span className="label">PLANT</span>
            SHP-01 Selang / 0.990 MW
          </p>
          <p>
            <span className="label">BUILD</span>
            Next.js, GSAP, Lenis. No analytics, no external services.
          </p>
          <a href="#intake" className="site-footer__top">
            Back to intake <span aria-hidden="true">↑</span>
          </a>
        </footer>
      </div>
    </section>
  );
}
