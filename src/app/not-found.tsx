import Link from "next/link";
import { Gauge } from "@/components/Gauge";

export default function NotFound() {
  return (
    <main id="main" className="notfound">
      <div className="shell notfound__inner">
        <p className="stage-kicker">
          <span>ERR 404 / NO ROUTE</span>
          <span>BREAKER OPEN</span>
        </p>
        <Gauge
          label="Plant output"
          code="GEN-01"
          fraction={0}
          readout="0.000"
          unit="MW"
          status="BREAKER OPEN"
          className="gauge--hero notfound__gauge"
        />
        <h1>
          Breaker tripped.
          <br />
          <span>Back to the grid.</span>
        </h1>
        <p>
          The route you asked for is not connected to this plant. The intake is
          still open.
        </p>
        <Link className="btn btn--amber" href="/">
          Back to the grid
        </Link>
      </div>
    </main>
  );
}
