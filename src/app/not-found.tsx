import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="notfound">
      <div className="shell notfound__inner">
        <p className="eyebrow">404</p>
        <h1>This page isn&apos;t wired up.</h1>
        <p>
          The link may be old, or the page moved. The work is still here.
        </p>
        <Link className="button" href="/">
          Back to the portfolio
        </Link>
      </div>
    </main>
  );
}
