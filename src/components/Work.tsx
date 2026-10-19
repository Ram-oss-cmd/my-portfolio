import Image from "next/image";
import { LoanCalculator } from "@/components/LoanCalculator";

export function Work() {
  return (
    <section id="work" className="work section">
      <div className="shell">
        <div className="section-head section-head--work" data-reveal>
          <p className="eyebrow">Selected work</p>
          <h2>Four systems, four different problems.</h2>
          <p className="section-head__note">
            A plant, an office, a lender and a machine. Different rooms, same job:
            make the work easier to run than the paper it replaced.
          </p>
        </div>

        <article className="project project--feature" data-reveal>
          <div className="project__copy">
            <p className="project__index">01</p>
            <h3>Selang Small Hydropower Project</h3>
            <p className="project__meta">Hydropower management · 0.990 MW</p>
            <p className="project__text">
              A management system for the plant: generation, status and the records
              the office needs, kept in one place instead of across paper and
              spreadsheets.
            </p>
            <dl className="project__facts">
              <div>
                <dt>My role</dt>
                <dd>Built the plant&apos;s management software</dd>
              </div>
              <div>
                <dt>Made with</dt>
                <dd>Web and application development, automation, deployment</dd>
              </div>
            </dl>
          </div>

          <figure className="project__media project__media--wide">
            <Image
              src="/work/selang-dashboard.png"
              width={1133}
              height={533}
              alt="Hydropower management dashboard for the Selang plant, showing generation and plant records"
              sizes="(max-width: 900px) 100vw, 60vw"
            />
            <figcaption>The plant dashboard, running on sample data.</figcaption>
          </figure>
        </article>

        <article className="project project--split" data-reveal>
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
            <p className="project__meta">Budget calculation &amp; human resources</p>
            <p className="project__text">
              Two systems for the office: a budget calculation tool and a human
              resource management system. Day-to-day records moved out of loose
              spreadsheets and into software the team could run themselves.
            </p>
            <dl className="project__facts">
              <div>
                <dt>My role</dt>
                <dd>Built the budget and HR systems</dd>
              </div>
              <div>
                <dt>Made with</dt>
                <dd>Application development, database-backed records</dd>
              </div>
            </dl>
          </div>
        </article>

        <article className="project project--calc" data-reveal>
          <div className="project__copy">
            <p className="project__index">03</p>
            <h3>Temke Investment Pvt. Ltd.</h3>
            <p className="project__meta">Hong Kong · Loan &amp; audit systems</p>
            <p className="project__text">
              I built the audit system and the entire loan-giving system: borrower
              records, repayment schedules and interest calculation. The calculator
              beside this is a live, working sample of that interest engine.
            </p>
            <dl className="project__facts">
              <div>
                <dt>My role</dt>
                <dd>Built the audit and loan systems end to end</dd>
              </div>
              <div>
                <dt>Made with</dt>
                <dd>Application development, financial calculation, reporting</dd>
              </div>
            </dl>
          </div>

          <div className="project__calculator">
            <h4>Try the interest engine</h4>
            <LoanCalculator />
          </div>
        </article>

        <article className="project project--cannon" data-reveal>
          <div className="project__copy">
            <p className="project__index">04</p>
            <h3>Automated water cannon</h3>
            <p className="project__meta">Team project · software contribution</p>
            <p className="project__text">
              We turned a manual spray hose into an automated one that records a
              human operator&apos;s motion and replays it. I worked on the software
              side; the hardware and the build were the team&apos;s.
            </p>
            <ol className="cannon__steps">
              <li>
                <span>Record</span>
                An operator moves the hose by hand.
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

          <div className="cannon__space">
            <p className="cannon__space-label">Prototype space</p>
            <p className="cannon__space-text">
              Kept open for the next build, with the cannon mounted.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
