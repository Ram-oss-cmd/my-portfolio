"use client";

import { useState } from "react";
import { TurbineSceneMount } from "@/components/TurbineSceneMount";
import { stack } from "@/data/content";

export function Powerhouse() {
  const [active, setActive] = useState(0);
  const current = stack[active];

  return (
    <section
      id="powerhouse"
      className="stage powerhouse"
      aria-labelledby="powerhouse-title"
    >
      <div className="shell">
        <header className="stage-head" data-reveal>
          <p className="stage-kicker">
            <span>STAGE 05 / POWERHOUSE</span>
            <span>EQUIPMENT IN SERVICE</span>
          </p>
          <h2 id="powerhouse-title" className="stage-title">
            Powerhouse<span className="accent">.</span>
          </h2>
          <p className="stage-sub">
            The equipment I actually run. Flip a switch to see what I used it for.
          </p>
        </header>

        <div className="powerhouse__grid" data-reveal>
          <div className="powerhouse__scene">
            <div className="powerhouse__scene-head">
              <span className="label">RUNNER / R-01</span>
              <span className="label">0.990 MW</span>
            </div>
            <TurbineSceneMount />
            <p className="powerhouse__scene-foot">
              TURBINE RUNNER · DECORATIVE MODEL · NO LIVE PLANT DATA
            </p>
          </div>

          <div className="switchboard">
            <div className="switchboard__head">
              <span className="label">SWITCHBOARD / 06 CIRCUITS</span>
              <span className="switchboard__status">BUS ENERGIZED</span>
            </div>

            <div className="switchboard__list" role="group" aria-label="Technology switchboard">
              {stack.map((item, index) => {
                const isActive = index === active;
                return (
                  <button
                    key={item.code}
                    type="button"
                    className="switch"
                    aria-pressed={isActive}
                    onClick={() => setActive(index)}
                  >
                    <span className="switch__code">{item.code}</span>
                    <span className="switch__name">{item.name}</span>
                    <span className="switch__lever" data-on={isActive} aria-hidden="true">
                      <span />
                    </span>
                    <span className="switch__state">{isActive ? "ON" : "STANDBY"}</span>
                  </button>
                );
              })}
            </div>

            <div className="switch-detail" aria-live="polite">
              <span className="label">{current.code} / USED FOR</span>
              <p>{current.usedFor}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
