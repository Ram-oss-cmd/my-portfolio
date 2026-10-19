import { about, site } from "@/data/content";

export function About() {
  return (
    <section id="about" className="about section">
      <div className="shell about__grid">
        <div className="section-head" data-reveal>
          <p className="eyebrow">About</p>
          <h2>I build for the people who keep things running.</h2>
          <p className="about__nepali" lang="ne">
            {site.nepaliName}
          </p>
        </div>

        <div className="about__body" data-reveal>
          <p className="about__lead">{about.lead}</p>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <blockquote className="about__quote">
            <p>{about.quote}</p>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
