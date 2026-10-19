# MESSAGES — append-only log

Format:
`[M-000] from -> to | TYPE | re: topic | status: OPEN|CLOSED`
body: what exactly / what was tried / what is needed / by when.

---

[M-000] lead -> all | DECISION | re: workspace | status: CLOSED
Project root is `shreeram-portfolio/`. Read .team/ at start, before each new task, before finishing. File ownership is in the team brief. Do not edit files you do not own.

[M-001] backend -> frontend,qa | DONE | re: API contract v1 | status: CLOSED
`.team/CONTRACT.md` STATUS: READY. Endpoints: GET /api/health; POST /api/contact (strict zod, hidden `website` honeypot, 5 req/min/IP, appends `data/messages.jsonl`, 201 `{ok,id}`); POST /api/loan-estimate (principal/annualRatePercent/months/method, 30 req/min/IP, returns monthlyPayment/totalInterest/totalPayable + full schedule, 2dp half-away-from-zero, sample-only). Stable error envelope `{error:{code,message,fields?,retryAfterSeconds?}}`; limits 16 KiB body, JSON content-type required. Worked loan examples with exact numbers in the contract. No endpoint code yet; build UI against contract.

[M-002] qa -> backend | BUG | re: success Content-Type missing charset | status: OPEN
BUG-01 (minor). Contract §Success responses requires `Content-Type: application/json; charset=utf-8`; actual is `application/json`. Repro: `curl -si http://127.0.0.1:3210/api/health`. Also affects 200/201 from /api/loan-estimate and /api/contact. Fix centrally in `src/lib/server/http.ts` `jsonResponse`/`errorResponse` (set the header explicitly). Evidence: health/contact/loan contract specs fail at the content-type assertion. Suspected owner: backend.
Also fixed a test-harness bug: Playwright JSON-encodes plain-string `data`, so malformed-JSON specs now send raw Buffers. No backend issue there; curl confirms INVALID_JSON is correct.

[M-003] qa -> backend | BUG | re: 405 Allow header in contract | status: OPEN
BUG-02 (minor, contract/framework mismatch). Contract says unsupported methods get framework 405 with an `Allow` header; Next 16.4.2 sends 405 with an empty body and NO `Allow`. Repro: `curl -si http://127.0.0.1:3210/api/loan-estimate` (GET) and `curl -si -X POST http://127.0.0.1:3210/api/health`. Expected per contract: `Allow` present. Actual: absent. Next action/owner: backend either (a) add explicit unsupported-method handlers returning 405 + `Allow`, or (b) file a CHANGE_REQUEST to drop the `Allow` guarantee (QA will ACK and adjust the three 405 assertions). Frontend: never assume a JSON body on 405. Everything else on the contract passed: 17/25 specs green, exact loan math A/B/C, boundaries, validation, honeypot, storage record, rate limits.

[M-004] qa -> frontend | INFO | re: E2E semantic hooks | status: OPEN
QA is writing Playwright specs for desktop + Pixel 7. Please keep these accessible names/roles (so tests assert behaviour, not implementation): h1 "Shreeram Chaudhary"; nav links/buttons "Work" and "Contact"; visible skip link to main content; loan form labels "Principal", "Annual interest rate", "Months", method choices "Reducing balance"/"Simple interest", submit "Calculate"; result labels "Monthly payment", "Total interest", "Total payable"; the exact sample label "Sample data, not client data"; contact labels "Name", "Email", "Message", submit "Send"; success/error feedback in `role="status"`/`role="alert"`; terminal input reachable after pressing `/`; REC/PLAY buttons named "REC"/"PLAY".
Needed: no action now; reply only if a label must differ. QA owns tests/e2e, do not edit them.

[M-002] backend -> frontend,qa | DONE | re: endpoints implemented | status: CLOSED
All three endpoints are implemented and self-tested on port 3100 via curl. Files: `src/app/api/{health,contact,loan-estimate}/route.ts`, `src/lib/loan.ts`, `src/lib/server/{http,rate-limit,messages}.ts`, `.env.example`. `npx tsc --noEmit` and eslint pass. Verified: health 200 shape; contact 201 + JSONL record, honeypot 201 with no write, validation/415/400/413/429 shapes, `Retry-After`; loan examples A/B/C byte-for-byte totals, validation and strict-key errors. Start with `npm run dev -- --port 3100`; curl commands in the message to qa. Contract unchanged from v1 except the loan validation example message now shows the actual string.

[M-003] backend -> frontend,qa | CHANGE_REQUEST | re: 405 Allow header wording | status: OPEN
QA BUG-02 confirmed: Next.js 16.4.2 automatic 405 responses have no `Allow` header (only auto OPTIONS does). Rather than add explicit handler boilerplate for every unsupported method, change the contract sentence to: 405 has an empty body and no `Allow`; clients must not rely on `Allow` or a JSON body on 405. No route, field or error-code change. Please ACK (qa: adjust contract test to assert absence of Allow or drop that assertion). BUG-01 (Content-Type charset) is fixed in `src/lib/server/http.ts`; FIX message follows after retest.

[M-005] qa -> backend,frontend | ACK | re: backend CHANGE_REQUEST (405 Allow) | status: CLOSED
QA ACKs the contract amendment: 405 = empty body, no `Allow` header; clients must not rely on `Allow` or a JSON body. Contract tests updated to assert absence of `Allow` and an empty body for all three endpoints. BUG-02 closes once the retest passes. Note the duplicate M-002/M-003 IDs from both agents; future QA entries use M-005+.
BUG-01 retest: `curl -si http://127.0.0.1:3210/api/health` now returns `content-type: application/json; charset=utf-8`; full contract suite rerun in progress. Frontend: ACK not needed for 405 wording, but note `src/lib/api.ts` is still `MOCK = true` with pre-contract field names (`annualRatePct`/`termMonths`, no `method`); that must be aligned to the real contract before E2E.

[M-006] qa -> backend | FIX | re: BUG-01/BUG-02 closed | status: CLOSED
Retest `npx playwright test --project=contract-api` = 25/25 PASS (8.2s). BUG-01 closed (charset present). BUG-02 closed under the ACKed contract wording (405 empty body, no Allow). No contract deviations remain.

[M-007] qa -> frontend | BUG | re: API client still mocked / contract field mismatch | status: OPEN
BUG-03 (major, integration blocker). `src/lib/api.ts` still has `MOCK = true`, and its types/payloads are pre-contract: `annualRatePct`/`termMonths` and no `method`; ContactResult is `{ok:true}`. The live API requires `{principal, annualRatePercent, months, method: "simple"|"reducing"}` and returns nested `error.message`/`error.fields`. Expected: UI calls the real endpoints and maps contract fields; Actual: requests never leave the page (loan-calculator/contact E2E cannot observe a POST). Evidence: src/lib/api.ts:39-52,54,130-157; e2e/loan-calculator.spec.ts and e2e/contact.spec.ts. Fix owner: frontend (F-10). Note the calculator currently has no method control; defaulting to `method: "reducing"` is acceptable for the UI as long as the request body matches the contract.

[M-006] backend -> qa | FIX | re: BUG-01 Content-Type + BUG-02 | status: CLOSED
BUG-01 fixed centrally in `src/lib/server/http.ts`: shared `JSON_HEADERS` sets `content-type: application/json; charset=utf-8` on `jsonResponse` and `errorResponse`, so all successes and app errors carry it. Verified on 127.0.0.1:3210: health 200, loan 200, loan 400 VALIDATION_ERROR, contact 201 all return the charset. BUG-02: contract amendment was ACKed by QA (M-005); CONTRACT.md says 405 = empty body, no `Allow`; auto OPTIONS has `Allow`. `npx tsc --noEmit` and eslint pass. QA: rerun the contract suite; no other contract changes.

[M-007] backend -> qa | ACK | re: BUG-01/BUG-02 retest | status: CLOSED
QA ACKed the 405 amendment and verified the charset header. Full contract suite is now 25/25 green; BUG-01 and BUG-02 are closed. No further backend code or contract changes. Frontend's `src/lib/api.ts` mock alignment (QA BUG-03) is frontend-owned; backend contract and endpoints are frozen.

[M-008] backend -> all | DONE | re: backend handoff | status: CLOSED
Backend is complete: CONTRACT.md v1 READY (with ACKed 405 wording), GET /api/health, POST /api/contact, POST /api/loan-estimate implemented, contract suite 25/25 PASS, tsc + eslint pass. No open backend questions. Remaining integration work is frontend BUG-03 (src/lib/api.ts still mocked with pre-contract fields).

[M-009] lead -> all | FIX | re: BUG-03 + E2E integration | status: CLOSED
BUG-03 closed: `src/lib/api.ts` is a real fetch client against the frozen contract (principal/annualRatePercent/months/method), maps the error envelope, 10s timeout. Frontend F-01..F-10 landed; board updated. Integration fixes in this pass: axe (removed opacity fade on Penstock copy; wordmark accessible name now contains visible "SC Shreeram Chaudhary"; nozzle buttons use their visible REC/PLAY text as the name), honeypot `display:none`, nozzle caption names the IoT water cannon, E2E alert queries scoped to form/calculator (Next injects a route-announcer `role="alert"`), pinned turbine stations revealed via `showStation()` helper, 404 link asserted by role.

[M-010] qa -> all | DONE | re: full suite sign-off | status: CLOSED
Full suite `npx playwright test` = 89/89 PASS (6.8m): desktop 32/32, mobile Pixel 7 32/32, contract-api 25/25. `npm run lint` clean, `npm run build` clean, `npm test` 10/10. Production smoke check: `/` 200, unknown URL 404, `/api/health` 200. QA_REPORT.md signed off; no open BUG or QUESTION. README rewritten with run, env, test and deploy instructions plus the placeholder list.

[M-011] lead,qa -> all | DONE | re: editorial redesign + resubmission | status: CLOSED
Full visual and content redesign landed. New editorial system: ivory `#F8F5EC`, cobalt `#244BFF`, vermilion `#FF5738`, lime `#D7FF64`, ink `#171717`; Instrument Serif display, Inter body, Noto Sans Devanagari for the Nepali name. New header with mobile menu, hero, about, four varied project compositions, grouped stack, cobalt contact section and footer.
Removed: Penstock, preloader, pinned turbine stations, terminal, gauges, workbench, switchboard, dark navy theme, gradient/glass effects, custom cursor (native cursor is instant), CV download, open slots and invented status labels. 0.990 MW now appears once, on the Selang project card. Added Linux content, real project images (`public/work/selang-dashboard.png`, `public/work/abhiyan-ledger.jpeg`), a reserved space for the automated water cannon and `rc.cloop@gmail.com`.
QA: E2E rewritten for the new DOM (`app-ready` hydration marker, menu helper, no terminal/pinned stations); full suite 79/79 PASS (desktop 27, Pixel 7 27, contract 25). `npm run lint` clean, `npm run build` clean, `npm test` 10/10. axe clean on desktop and Pixel 7; no horizontal overflow at 320–1440 px. README updated.

[M-012] lead,qa -> all | DONE | re: content corrections and submission | status: CLOSED
Revised the page after review. Hero: removed the "Shreeram Chaudhary · Nepal" eyebrow and red dot, tightened top spacing, and replaced the redundant identity intro. About: removed the "About" eyebrow and the Devanagari name under the heading; added the Selang inventory system (real data, in use), changed Abhiyan to budget logging and management, and rewrote the water-cannon credit as hardware and software (mainly hardware). Quote now says "paper process".
Work: heading now says four systems so far; Selang caption says live real plant data; roles and "Made with" blocks removed from all projects; Temke is text-only with a confidentiality note (no calculator or image); real water-cannon and control-system photos added.
Removed the Stack section and its nav link entirely, along with the loan calculator UI and its spec. The `/api/loan-estimate` contract remains covered.
Verification: lint clean; build clean; unit 10/10; Playwright 69/69 (desktop 22, Pixel 7 22, contract 25); axe clean; desktop and mobile screenshots checked.
