import { learning, stackGroups } from "@/data/content";

export function Stack() {
  return (
    <section id="stack" className="stack section">
      <div className="shell">
        <div className="section-head section-head--split" data-reveal>
          <div>
            <p className="eyebrow">Stack</p>
            <h2>What I actually use.</h2>
          </div>
          <p className="section-head__note">
            The tools and systems that show up in the work above.
          </p>
        </div>

        <div className="stack__grid">
          {stackGroups.map((group) => (
            <section className="stack__group" key={group.title} data-reveal>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="stack__foot" data-reveal>
          <div className="stack__linux">
            <h3>Linux is home base.</h3>
            <p>
              I work in a Linux terminal daily — files, services, deployment. When
              a client&apos;s office runs Windows, the same work ships as VBA.
            </p>
          </div>
          <div className="stack__learning">
            <h3>Learning now</h3>
            <p>{learning.join(", ")}. No certificates yet — just projects in progress.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
