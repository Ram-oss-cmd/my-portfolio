import { site } from "@/data/content";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <p className="footer__brand">
          {site.name} <span lang="ne">{site.nepaliName}</span>
        </p>
        <p className="footer__place">Nepal · NPT</p>
        <a className="footer__top" href="#top">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
