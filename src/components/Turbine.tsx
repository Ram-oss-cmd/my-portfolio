"use client";

import { useEffect, useRef, useState } from "react";
import { Gauge } from "@/components/Gauge";
import { LoanCalculator } from "@/components/LoanCalculator";
import { smallerBuilds, stations } from "@/data/content";
import { useMotionProfile } from "@/hooks/useMotionProfile";
import { ScrollTrigger } from "@/lib/gsap";

function StationPlate({ tag }: { tag: string }) {
  if (tag === "SHP-01") {
    return (
      <div className="plate plate--plant">
        <span className="plate__label">PLANT / MANAGEMENT</span>
        <Gauge
          label="Selang SHP"
          code="GEN-01"
          fraction={0.99 / 1.2}
          readout="0.990"
          unit="MW"
          status="RATED OUTPUT"
          className="gauge--plate"
        />
        <ol className="flow" aria-label="Water path">
          <li>INTAKE</li>
          <li>PENSTOCK</li>
          <li>TURBINE</li>
          <li>GRID</li>
        </ol>
        <p className="plate__foot">Hydropower management system — in service.</p>
      </div>
    );
  }

  if (tag === "ABH-02") {
    return (
      <div className="plate plate--modules">
        <span className="plate__label">TWO SYSTEMS / IN SERVICE</span>
        {[
          ["MOD-01", "Budget calculation", "Numbers, totals and the money picture."],
          ["MOD-02", "Human resource management", "People and records in one place."],
        ].map(([code, name, body]) => (
          <div className="module" key={code}>
            <div className="module__head">
              <span>{code}</span>
              <span className="lamp" aria-hidden="true" />
            </div>
            <strong>{name}</strong>
            <p>{body}</p>
          </div>
        ))}
      </div>
    );
  }

  if (tag === "IOT-04") {
    return (
      <div className="plate plate--diagram">
        <span className="plate__label">RECORD / REPLAY</span>
        <ol className="diagram" aria-label="Water cannon operation">
          <li>
            <span className="diagram__code">01</span>
            <strong>Human moves the hose</strong>
          </li>
          <li>
            <span className="diagram__code">02</span>
            <strong>Motion recorded</strong>
          </li>
          <li>
            <span className="diagram__code">03</span>
            <strong>Stored</strong>
          </li>
          <li>
            <span className="diagram__code">04</span>
            <strong>Replayed by machine</strong>
          </li>
        </ol>
        <p className="plate__foot">
          Team project. I contributed the record-and-replay idea in software and
          did not build it alone.
        </p>
      </div>
    );
  }

  return null;
}

export function Turbine() {
  const { ready, reduced, desktop } = useMotionProfile();
  const pinned = ready && desktop && !reduced;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!pinned) return;
    const scroller = scrollRef.current;
    if (!scroller) return;

    const trigger = ScrollTrigger.create({
      trigger: scroller,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const next = Math.min(
          stations.length - 1,
          Math.floor(self.progress * stations.length),
        );
        setActive((current) => (current === next ? current : next));
      },
    });

    ScrollTrigger.refresh();
    return () => trigger.kill();
  }, [pinned]);

  return (
    <section
      id="turbine"
      className={`stage turbine ${pinned ? "is-pinned" : ""}`}
      aria-labelledby="turbine-title"
    >
      <div className="shell">
        <header className="stage-head" data-reveal>
          <p className="stage-kicker">
            <span>STAGE 03 / TURBINE</span>
            <span>WORK SPINS</span>
          </p>
          <h2 id="turbine-title" className="stage-title">
            Turbine<span className="accent">.</span>
          </h2>
          <p className="stage-sub">
            Four stations. Each one is a place where the water did some work.
          </p>
        </header>
      </div>

      <div className="turbine__scroll" ref={scrollRef}>
        <div className="turbine__sticky">
          <div className="shell turbine__layout">
            <ol className="turbine__progress" aria-hidden="true">
              {stations.map((station, index) => (
                <li key={station.tag} className={index === active ? "is-active" : undefined}>
                  <span>{station.tag}</span>
                  <span className="turbine__tick" />
                </li>
              ))}
            </ol>

            <div className="turbine__stations">
              {stations.map((station, index) => {
                const hidden = pinned && index !== active;
                return (
                  <article
                    key={station.tag}
                    className={`station ${index === active ? "is-active" : ""}`}
                    aria-hidden={hidden || undefined}
                    inert={hidden}
                  >
                    <div className="station__body">
                      <div className="station__meta">
                        <span className="tag tag--amber">{station.tag}</span>
                        {station.capacity ? (
                          <span className="tag">{station.capacity}</span>
                        ) : null}
                        {station.subtitle ? (
                          <span className="station__subtitle">{station.subtitle}</span>
                        ) : null}
                      </div>

                      <h3 className="station__title">{station.title}</h3>

                      <dl className="station__facts">
                        <div>
                          <dt>PROBLEM</dt>
                          <dd>{station.problem}</dd>
                        </div>
                        <div>
                          <dt>BUILT</dt>
                          <dd>{station.built}</dd>
                        </div>
                      </dl>

                      <ul className="station__skills" aria-label="Skills used">
                        {station.skills.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>

                      {station.team ? (
                        <p className="station__credit">
                          TEAM PROJECT — I contributed; I did not build it alone.
                        </p>
                      ) : null}
                    </div>

                    <div className="station__plate">
                      {station.plate === "calculator" ? <LoanCalculator /> : null}
                      <StationPlate tag={station.tag} />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {pinned ? (
            <p className="turbine__hint" aria-hidden="true">
              SCROLL / NEXT STATION
            </p>
          ) : null}
        </div>
      </div>

      <div className="shell">
        <section className="smaller" aria-labelledby="smaller-title">
          <div className="smaller__head">
            <h3 id="smaller-title">Smaller builds</h3>
            <span className="label">SB / STRIP</span>
          </div>
          <div className="smaller__grid">
            {smallerBuilds.map((build) => (
              <article
                className="smaller__card"
                key={build.code}
                data-placeholder={build.placeholder || undefined}
              >
                <div className="smaller__meta">
                  <span className="tag">{build.code}</span>
                  <span className="tag">{build.status}</span>
                </div>
                <h4>{build.title}</h4>
                <p>{build.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
