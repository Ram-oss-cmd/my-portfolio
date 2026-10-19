"use client";

import Link from "next/link";
import { useState } from "react";
import { nav, site } from "@/data/content";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__inner shell">
        <Link className="brand" href="/" aria-label={`SC ${site.name} — home`}>
          <span className="brand__mark" aria-hidden="true">
            SC
          </span>{" "}
          <span className="brand__name">
            Shreeram
            <br />
            Chaudhary
          </span>
        </Link>

        <div className="site-header__nav" data-open={open}>
          <nav id="primary-navigation" className="site-nav" aria-label="Primary">
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={
                      item.label === "Contact"
                        ? "site-nav__link site-nav__link--contact"
                        : "site-nav__link"
                    }
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
    </header>
  );
}
