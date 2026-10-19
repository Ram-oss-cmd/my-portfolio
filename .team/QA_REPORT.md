# QA REPORT

Owner: **qa**. Only QA signs off here.

STATUS: **SIGNED OFF** — all gates green. Full suite 79/79 after the editorial redesign on 2026-10-19.

Last updated: 2026-10-19

## 1. Scope and quality bar

Gate: nothing is DONE until QA reproduces it. Sign-off requires ALL of:

| # | Check | Command | Result |
|---|---|---|---|
| G-01 | Lint clean | `npm run lint` | PASS |
| G-02 | Production build clean | `npm run build` | PASS |
| G-03 | Unit tests pass | `npm test` | PASS (10/10) |
| G-04 | Contract tests pass against real app | `npx playwright test --project=contract-api` | PASS (25/25) |
| G-05 | E2E desktop passes | `npx playwright test --project=desktop-chromium` | PASS (27/27) |
| G-06 | E2E mobile passes | `npx playwright test --project=mobile-chromium` | PASS (27/27) |
| G-07 | Zero browser console errors / page errors | asserted in every E2E spec | PASS |
| G-08 | axe: no serious or critical violations | `npx playwright test e2e/a11y.spec.ts` | PASS |
| G-09 | prefers-reduced-motion fallback works | `npx playwright test e2e/reduced-motion.spec.ts` | PASS |
| G-10 | Custom 404 works | `npx playwright test e2e/not-found.spec.ts` | PASS |
| G-11 | Loan calculator + contact form work end to end, including error/rate-limit paths | e2e specs | PASS |
| G-12 | Frontend calls real endpoints (no mock data) | route/response inspection in E2E | PASS |
| G-13 | No real client data, no invented statistics | manual content audit | PASS |
| G-14 | Every BOARD.md item DONE; no open BUG/QUESTION | team files | PASS |

Environment: Windows 10, Node v24.22.0, npm 11.6.1, Next 16.4.2, Playwright Chromium.
Test server: Playwright `webServer` runs `npm run build && npm start -- -p 3211` (production build), `reuseExistingServer: true`.

## 2. Test harness (owned by QA)

| File | Purpose |
|---|---|
| `vitest.config.mts` | Unit tests, node environment |
| `tests/support/loan-math.ts` | Independent oracle for `.team/CONTRACT.md` loan rules (does not import `src/lib/loan.ts`) |
| `tests/unit/loan-math.test.ts` | 10 unit tests: zero interest, 1 month, large principal, reducing vs flat, rounding, schedule invariants, contract worked examples A/B/C, invalid inputs |
| `playwright.config.ts` | Port 3211 (production build), desktop (Desktop Chrome) + mobile (Pixel 7) + `contract-api` project; contract runs last so rate-limit state cannot trip UI tests |
| `e2e/support/site.ts` | `openSite()` waits for the `app-ready` hydration marker before interacting; `openMenuIfNeeded()` opens the mobile nav |
| `e2e/contract/health.spec.ts` | Liveness payload, no-store, per-request evaluation, 405 |
| `e2e/contract/loan.spec.ts` | Worked examples against independent oracle, boundaries, validation, unknown keys, invalid JSON, 415, 413, 405, 429 |
| `e2e/contract/contact.spec.ts` | 201 + stored record, honeypot not stored, field limits, unknown keys, invalid JSON, 415, 413, 405, 429 |
| `e2e/*.spec.ts` | UI E2E: home, project images, loan calculator, contact, REC/PLAY, 404, a11y, reduced motion, content audit |

Unit test command: `npm test`.
E2E command: `npm run test:e2e` (all projects) or per project above.

## 3. Contract coverage matrix (CONTRACT.md v1)

| Area | Cases | Status |
|---|---|---|
| GET /api/health | 200 payload/version/timestamp; `Cache-Control: no-store`; per-request; POST 405 + Allow | WRITTEN |
| POST /api/loan-estimate success | Exact equality with independent oracle for reducing, simple, 0%, max boundaries; full schedule; 2dp rounding | WRITTEN |
| POST /api/loan-estimate errors | VALIDATION_ERROR per field (principal, rate, months, method), unknown key `_root`, INVALID_JSON, 415, 413, 405, RATE_LIMITED 30/60s with Retry-After | WRITTEN |
| POST /api/contact success | 201 `{ok,id}` UUID v4; JSONL record fields only (id, receivedAt, name, email, message); trimmed values; no IP/user-agent | WRITTEN |
| Honeypot | Non-empty `website` returns identical 201 but persists nothing | WRITTEN |
| POST /api/contact errors | All field limits (name 1–100, email ≤254, message 10–5000, website ≤200), unknown key, INVALID_JSON, 415, 413, 405, RATE_LIMITED 5/60s | WRITTEN |
| Error envelope | Stable `{error:{code,message,fields?,retryAfterSeconds?}}`, no-store, no stack/paths | WRITTEN |

Note: contract tests run under Playwright's `request` fixture against the real dev server, not by importing route handlers. Each test uses a unique `x-forwarded-for` so rate-limit buckets are isolated; rate-limit specs use one fixed fake IP.

## 4. Independent loan math (sample data only)

Oracle: `tests/support/loan-math.ts`, separate implementation of the contract's exact rounding rules (2dp half away from zero; reducing carries rounded closing balances; final month pays off exactly; simple allocates rounded base parts with a final remainder).

| Case | Input (SAMPLE DATA) | Expected |
|---|---|---|
| Zero interest | P=120,000, 0%, 12m, reducing | EMI 10,000.00; interest 0; payable 120,000.00 |
| One month | P=100,000, 12%, 1m, reducing | EMI 101,000.00; interest 1,000.00 |
| Large principal | P=10,000,000, 10.5%, 240m, reducing | EMI 99,837.99; interest 13,961,116.58; payable 23,961,116.58 |
| Reducing vs flat | P=100,000, 12%, 12m | interest 6,618.53 < flat 12,000.00 |
| Rounding | P=1,000, 10%, 3m | EMI 338.90; interest 16.71; all values 2dp; closing 0 |
| Schedule invariant | P=1,000,000, 12%, 24m | Σ principal = 1,000,000; closing 0 |
| Worked A (simple) | P=250,000, 12.5%, 24m | EMI 13,020.84; interest 62,500.00; payable 312,500.00; final payment 13,020.68 |
| Worked B (reducing) | P=250,000, 12.5%, 24m | EMI 11,826.83; interest 33,843.87; payable 283,843.87; final payment 11,826.78 |
| Worked C (0%) | P=250,000, 0%, 24m | EMI 10,416.67; interest 0; final payment 10,416.59 |

Contract success responses must deep-equal the oracle output (exact field names and values). UI must label every result “Sample data, not client data”.

## 5. E2E plan

Desktop Chrome + Pixel 7 (touch). Each spec collects `console` errors and `pageerror`; any error fails the test.

| ID | Spec | Checks |
|---|---|---|
| E2E-01 | `home.spec.ts` | 200; h1 "Software for systems that can’t afford to be sloppy"; hero name, Nepali name, Kathmandu clock; skip link; nav row on desktop; real project images load; no preloader; no CV link |
| E2E-02 | `loan-calculator.spec.ts` | 250k/12.5/24 reducing → 11,826.83 / 33,843.87 / 283,843.87; simple switch → 13,020.84; sample-data label; real `/api/loan-estimate` only with valid sample values; inline validation; mocked 500/429 recovery |
| E2E-03 | `contact.spec.ts` | Real POST /api/contact 201; success status; honeypot hidden; client validation; mocked 500/429 error paths; "Have something worth building?" heading |
| E2E-04 | `nozzle.spec.ts` | `#nozzle-controls` REC/PLAY plus R/P keys; 6 s cap shown; path replays; reduced-motion fallback |
| E2E-05 | `not-found.spec.ts` | Unknown URL returns 404, "This page isn't wired up.", link returns home |
| E2E-06 | `a11y.spec.ts` | Skip link first tab stop; focus visible; one h1; landmarks; mobile menu opens before nav visibility check; axe no serious/critical |
| E2E-07 | `reduced-motion.spec.ts` | `reducedMotion: "reduce"`; content revealed without scrolling; record/replay usable; no terminal |
| E2E-08 | `content-audit.spec.ts` | Real email; Linux present; 0.990 MW appears exactly once (Selang card); no CV link; no fake terminal/status labels |

## 6. Bugs

| ID | Title | Severity | Status | Evidence |
|---|---|---|---|---|
| BUG-01 | Success responses missing `charset=utf-8` on Content-Type | minor | CLOSED | Fixed in src/lib/server/http.ts; contract suite green |
| BUG-02 | 405 `Allow` header absent (contract/framework mismatch) | minor | CLOSED | Contract amendment ACKed; tests assert empty body + no Allow |
| BUG-03 | `src/lib/api.ts` still `MOCK = true`, pre-contract fields, no `method` | major | CLOSED | Real fetch client with contract fields; E2E observes live POST/GET in loan + contact specs |

## 7. Phase 2 results

Filled in when the app lands. PASS/FAIL per area; bugs linked to MESSAGES.md IDs.

| Area | Result | Evidence |
|---|---|---|
| Lint | PASS | `npm run lint` — clean (playwright-report/test-results ignored) |
| Build | PASS | `npm run build` — 11 static pages, API routes dynamic |
| Unit | PASS (10/10) | `npm test` |
| Contract | PASS (25/25) | `npx playwright test --project=contract-api` |
| E2E desktop | PASS (27/27) | `npx playwright test --project=desktop-chromium` |
| E2E mobile | PASS (27/27) | `npx playwright test --project=mobile-chromium` |
| a11y / axe | PASS | No serious/critical violations on desktop or Pixel 7 |
| Reduced motion | PASS | No intro animation, no infinite running animations, controls usable |
| 404 | PASS | Custom breaker page returns 404 and links home |
| Console errors | PASS | Zero unexpected console/page errors in every spec |
| Content audit | PASS | Sample-data label, team credit, no invented metrics/social proof |

Known deliberate behaviours:

- Hydration marker: `Nozzle` adds `app-ready` to `<html>`; `openSite()` waits
  for it so keyboard listeners exist before tests press R/P.
- Scroll reveal: `[data-reveal]` starts hidden only when `.motion-ready` is set
  and animates in via ScrollTrigger; reduced motion reveals everything up front.
  Full-page screenshots taken without scrolling must force the reveal class.
- Navigation collapses into a Menu button below 821 px; specs that assert nav
  links call `openMenuIfNeeded()` first.
- The loan calculator fires one sample calculation on mount. Error-path tests
  mock `/api/loan-estimate`, so the alert can appear before the form is
  submitted; assertions are scoped to `.loan`.
- Next.js injects `#__next-route-announcer__` with `role="alert"`; E2E alert
  assertions are scoped to the form/calculator, not the document.

## 8. Sign-off

VERDICT: **SIGNED** — 2026-10-19. Lint, build, unit (10/10), contract (25/25)
and E2E desktop/mobile (54/54) all pass; 79/79 Playwright tests total. No open
bugs or questions.
