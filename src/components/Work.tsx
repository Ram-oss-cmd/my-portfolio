import Image from "next/image";

export function Work() {
  return (
    <section id="work" className="work section">
      <div className="shell">
        <div className="section-head section-head--work" data-reveal suppressHydrationWarning>
          <p className="eyebrow">Selected work</p>
          <h2>Four systems so far. Each one a different problem.</h2>
          <p className="section-head__note">
            I’ve built solutions across diverse domains, including plant
            management, office operations, lending, and machinery. Each project
            focuses on streamlining workflows, improving efficiency, and
            replacing manual, paper-based processes with practical digital
            solutions.
          </p>
          <p className="section-head__note">
            Here are some of the projects I’ve worked on.
          </p>
        </div>

        <article className="project project--feature" data-reveal suppressHydrationWarning>
          <div className="project__copy">
            <p className="project__index">01</p>
            <h3>Selang Small Hydropower Project</h3>
            <p className="project__meta">Hydropower management · 0.990 MW</p>
            <p className="project__text">
              A management system for the plant: generation, status and the records
              the office needs, kept in one place instead of across paper and
              spreadsheets. It also manages the hydropower&apos;s inventory, so
              stock and plant records live in the same system.
            </p>
          </div>

          <figure className="project__media project__media--wide">
            <Image
              src="/work/selang-dashboard.png"
              width={1133}
              height={533}
              alt="Hydropower management dashboard for the Selang plant, showing generation and plant records"
              sizes="(max-width: 900px) 100vw, 60vw"
            />
            <figcaption>The plant dashboard, running live on real plant data.</figcaption>
          </figure>
        </article>

        <article className="project project--split" data-reveal suppressHydrationWarning>
          <figure className="project__media project__media--phone">
            <Image
              src="/work/abhiyan-ledger.jpeg"
              width={702}
              height={1528}
              alt="Ledger app for Abhiyan Engineering Nepal, showing transaction entries and totals"
              sizes="(max-width: 900px) 80vw, 30vw"
            />
          </figure>

          <div className="project__copy">
            <p className="project__index">02</p>
            <h3>Abhiyan Engineering Nepal</h3>
            <p className="project__meta">Budget logging &amp; human resources</p>
            <p className="project__text">
              Two systems for the office: a budget logging and management system
              and a human resource management system. Records that used to take
              time to write and were easily lost in paper copies are now digital,
              and the team can run them themselves.
            </p>
          </div>
        </article>

        <article className="project project--text" data-reveal suppressHydrationWarning>
          <div className="project__copy">
            <p className="project__index">03</p>
            <h3>Temke Investment Pvt. Ltd.</h3>
            <p className="project__meta">Hong Kong · Loan &amp; audit systems</p>
            <p className="project__text">
              I&apos;ve built the audit system and the entire loan-giving system:
              borrower records, repayment schedules, interest calculation and
              many more. The work is confidential, so client data and screenshots
              are not shown.
            </p>
          </div>
        </article>

        <article className="project project--cannon" data-reveal suppressHydrationWarning>
          <div className="project__copy">
            <p className="project__index">04</p>
            <h3>Automated water cannon — descender flushing system (RDF)</h3>
            <p className="project__meta">Trishuli 3A Hydropower, Rasuwa · 60 MW · Team project</p>
            <p className="project__text">
              We turned a powerful, manually operated water cannon into an
              automated water cannon that records a human operator&apos;s motion
              and replays it. It was implemented at the 60 MW Trishuli 3A
              Hydropower in Rasuwa district for descender flushing. Operators can
              upload many motions and replay them later. I contributed to both the
              hardware and the software, mainly the hardware.
            </p>
            <ol className="cannon__steps">
              <li>
                <span>Record</span>
                An operator aims the cannon by hand.
              </li>
              <li>
                <span>Store</span>
                The path is saved.
              </li>
              <li>
                <span>Replay</span>
                The machine repeats the same movement.
              </li>
            </ol>
          </div>

          <div className="cannon__media">
            <figure className="project__media">
              <Image
                src="/work/water-cannon.jpeg"
                width={1350}
                height={1600}
                alt="The automated water cannon: a red motorised pipe fitting with servo motors and a pressure gauge"
                sizes="(max-width: 1024px) 100vw, 38vw"
              />
              <figcaption>The cannon.</figcaption>
            </figure>
            <figure className="project__media">
              <Image
                src="/work/water-cannon-system.jpeg"
                width={1600}
                height={1267}
                alt="Half of the automated water cannon control system: controller board, wiring and a handheld remote"
                sizes="(max-width: 1024px) 100vw, 38vw"
              />
              <figcaption>Half of the automated water cannon control system.</figcaption>
            </figure>
          </div>
        </article>
      </div>
    </section>
  );
}
