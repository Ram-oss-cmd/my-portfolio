# BOARD

Status values: TODO / DOING / REVIEW / QA / DONE

| ID | Task | Owner | Status | Notes |
|----|------|-------|--------|-------|
| B-01 | Write .team/CONTRACT.md (schemas, errors, rate limit, loan worked examples) | backend | DONE | STATUS: READY |
| F-01 | Design system, layout shell, fonts, metadata, OG, sitemap/robots, 404 | frontend | DONE | `layout.tsx`, `globals.css`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, `not-found.tsx` |
| F-02 | Preloader gauge, Intake hero, Kathmandu clock | frontend | DONE | Preloader 0.000 → 0.990 MW, skippable; live NPT clock |
| F-03 | Penstock about + skills gauges | frontend | DONE | Pinned scrub; gauges are qualitative, no invented scores |
| F-04 | Turbine pinned stations SHP-01 / ABH-02 / TMK-03 / IOT-04 | frontend | DONE | Pinned on desktop, stacked on mobile; inactive stations inert |
| F-05 | REC/PLAY nozzle (Zustand, 6s cap, reduced motion, touch) | frontend | DONE | Canvas particles, R/P keys, still-path fallback under reduced motion |
| F-06 | Loan calculator UI (sample data label) | frontend | DONE | TMK-03; defaults 250,000 / 12.5% / 24m reducing; contract fields |
| F-07 | Workbench terminal (/ shortcut, commands, VBA skin) | frontend | DONE | help/whoami/projects/learning/vba/contact/clear; `/` anywhere |
| F-08 | Powerhouse switchboard | frontend | DONE | Toggles reveal real use cases only |
| F-09 | Grid contact form UI + MW meter + copy email | frontend | DONE | Honeypot hidden; role=status/alert feedback; copy-to-clipboard |
| F-10 | src/lib/api.ts typed client with error/timeout states | frontend | DONE | Real fetch calls; contract error envelope + 10s timeout; BUG-03 closed |
| B-02 | GET /api/health | backend | DONE | request-time JSON, no-store |
| B-03 | GET/POST /api/contact (zod, honeypot, rate limit, jsonl) | backend | DONE | POST only; GET → 405 |
| B-04 | POST /api/loan-estimate + src/lib/loan.ts | backend | DONE | matches contract examples A/B/C |
| Q-01 | Test plan in QA_REPORT.md | qa | DONE | Plan + harness in place |
| Q-02 | Independent loan math unit tests (5+ cases) | qa | DONE | 10 tests pass (`npm test`); independent oracle in tests/support/loan-math.ts |
| Q-03 | Contract tests | qa | DONE | 25/25 pass against live API; BUG-01/02 closed |
| Q-04 | E2E desktop + mobile, a11y, reduced motion, 404 | qa | DONE | 89/89 Playwright across desktop, Pixel 7 and contract-api; pinned-station helper; axe clean |
| L-01 | Scaffold, deps, team workspace, commit | lead | DONE | |
| L-02 | Final verify, README, commit, shutdown | lead | DONE | lint/build/unit/E2E green; README rewritten; committed |
| R-01 | Editorial redesign: ivory/cobalt/vermilion/lime, serif + sans, new header/hero/about/work/stack/contact/footer | lead | DONE | `Hero`, `About`, `Work`, `Stack`, `ContactSection`, `SiteFooter`, `SiteHeader`; old dark theme removed |
| R-02 | Remove old theme pieces: Penstock, preloader, pinned turbine, terminal, gauges, custom cursor, CV, open slots, 0.990 MW outside the Selang card | lead | DONE | Deleted 11 components + 2 hooks; native cursor restored; REC/PLAY moved into the hero card |
| R-03 | Real project visuals, water-cannon space, Linux content, contact email | lead | DONE | `public/work/selang-dashboard.png`, `public/work/abhiyan-ledger.jpeg`; reserved prototype panel; `rc.cloop@gmail.com` |
| R-04 | Rewrite E2E for new DOM and rerun all gates | qa | DONE | 79/79 Playwright (desktop 27, Pixel 7 27, contract 25); lint/build/unit 10/10 green |
| R-05 | Copy and layout corrections: remove hero eyebrow, Stack and loan calculator; revise About/Work facts; add water-cannon photos | lead | DONE | Real inventory, budget logging, confidential Temke, hardware/software credit; 69/69 Playwright |
