import { NozzleControls } from "@/components/NozzleControls";
import { learning, site } from "@/data/content";

export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="shell hero__grid">
        <div className="hero__main" data-reveal suppressHydrationWarning>
          <h1>
            {site.headline.lead}
            <em>{site.headline.emphasis}</em>
            {site.headline.tail}
          </h1>

          <p className="hero__lede">{site.intro}</p>

          <div className="hero__actions">
            <a className="button" href="#work">
              Explore my work <span aria-hidden="true">↘</span>
            </a>
            <a className="link-underline" href="#contact">
              Get in touch
            </a>
          </div>
        </div>

        <aside className="hero__aside" aria-label="At a glance">
          <div className="hero__card hero__card--cobalt" data-reveal suppressHydrationWarning>
            <span className="hero__nepali" lang="ne">
              {site.nepaliName}
            </span>
            <p className="hero__role">
              Software developer
              <br />
              Nepal
            </p>
          </div>

          <div className="hero__card hero__card--lime" data-reveal suppressHydrationWarning>
            <p className="hero__card-label">Currently learning</p>
            <p className="hero__learning">{learning.join(" · ")}</p>
          </div>

          <div className="hero__card hero__card--play" data-reveal suppressHydrationWarning>
            <p className="hero__card-label">Record a movement. Replay it.</p>
            <NozzleControls id="nozzle-controls" />
            <p className="hero__card-note">
              The idea behind the automated water cannon. Up to 6 seconds.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
