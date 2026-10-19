import Link from "next/link";
import { nav, site } from "@/data/content";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label={`SC ${site.name} — home`}>
        <span className="wordmark__mark" aria-hidden="true">
          SC
        </span>{" "}
        <span className="wordmark__name">
          Shreeram
          <br />
          Chaudhary
        </span>
      </Link>

      <nav className="site-nav" aria-label="Primary">
        <ul>
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={
                  item.label === "Work"
                    ? "site-nav__link site-nav__link--work"
                    : item.label === "Contact"
                      ? "site-nav__link site-nav__link--contact"
                      : "site-nav__link"
                }
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header-status" aria-hidden="true">
        <span className="status-dot" />
        <span>0.990 MW</span>
      </div>
    </header>
  );
}
