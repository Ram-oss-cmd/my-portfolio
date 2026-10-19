import Link from "next/link";
import { KathmanduClock } from "@/components/KathmanduClock";
import { NozzleControls } from "@/components/NozzleControls";
import { site } from "@/data/content";

export function IntakeHero() {
  return (
    <section id="intake" className="hero stage" aria-labelledby="hero-title">
      <div className="hero__flow" aria-hidden="true">
        <span className="hero__flow-line" />
        <span className="hero__flow-dash" />
      </div>

      <div className="shell hero__inner">
        <div className="hero__top">
          <p className="stage-kicker">
            <span>STAGE 01 / INTAKE</span>
            <span>HEADRACE ONLINE</span>
          </p>
          <p className="hero__coords">{site.coordinates}</p>
        </div>

        <div className="hero__title-block">
          <h1 id="hero-title" className="hero__name" aria-label={site.name}>
            <span>Shreeram</span>
            <span className="hero__name-last">
              Chaudhary<span className="accent">.</span>
            </span>
          </h1>
          <p className="hero__nepali" lang="ne">
            {site.nepaliName}
          </p>
        </div>

        <div className="hero__bottom">
          <p className="hero__line">{site.headline}</p>

          <div className="hero__controls-wrap">
            <p className="label">SIGNATURE / REC · PLAY NOZZLE</p>
            <NozzleControls id="nozzle-hero-controls" />
            <p className="hero__control-note">
              This is the idea behind my IoT water cannon: record a human&apos;s
              motion, then replay it. Record the cursor for up to 6 seconds, then
              replay the exact motion as water. On touch: tap and drag. Keys R / P
              work anywhere.
            </p>
          </div>
        </div>

        <div className="hero__meta">
          <KathmanduClock />
          <div className="hero__datum">
            <span className="label">PLANT</span>
            <span>SHP-01 / SELANG</span>
            <span className="hero__datum-value">0.990 MW</span>
          </div>
          <Link href="#penstock" className="hero__cue">
            <span>02 / PENSTOCK</span>
            <span className="hero__cue-arrow" aria-hidden="true">
              ↓
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
