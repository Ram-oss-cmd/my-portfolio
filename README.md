# Shreeram Chaudhary — portfolio

A one-page portfolio built as a journey of water through a hydropower plant:
Intake → Penstock → Turbine → Workbench → Powerhouse → Grid. Night-shift SCADA
control room meets engineer's blueprint: slate ink, phosphor amber, glacial cyan,
Instrument Serif + JetBrains Mono + Noto Sans Devanagari.

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, GSAP + ScrollTrigger, Lenis,
Zustand, React Three Fiber. No analytics and no external services.

## Run locally

Node 20.9+.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Production build:

```bash
npm run build
npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the deployed origin so `metadataBase`, Open Graph,
`sitemap.xml` and `robots.txt` point at the right place.

## Edit your content

All visitor-facing copy lives in `src/data/content.ts`. Components read from it;
you should not need to touch JSX to change names, projects, skills or copy.

Placeholders to fill before launch:

| Where | Placeholder |
|---|---|
| `contact.email` | `hello@example.com` — replace and set `emailIsPlaceholder` to `false` |
| `contact.linkedinUrl`, `contact.cvUrl` | empty; the Grid shows PLACEHOLDER buttons until wired |
| `smallerBuilds` | two "Open slot" cards reserved for future builds |
| `NEXT_PUBLIC_SITE_URL` | production origin |

The loan calculator is deliberately sample data (NPR 250,000 / 12.5% / 24 months)
and is labelled "Sample data, not client data".

## Contact messages

Messages POST to `/api/contact` and append one JSON line to
`data/messages.jsonl` (git-ignored). Email forwarding is off by default; it turns
on only when all three variables below are set. See `.env.example`.

```
RESEND_API_KEY=
CONTACT_EMAIL_TO=
CONTACT_EMAIL_FROM=
```

Rate limits are in-memory per server process: 5 requests / 60 s / IP for contact,
30 / 60 s / IP for loan estimates.

## Tests

```bash
npm test                      # loan math unit tests (Vitest)
npx playwright test           # build + E2E on desktop, Pixel 7, API contract
```

Playwright starts the production build on port 3211 (override with `PORT`). The
API contract lives in `.team/CONTRACT.md`; contract specs are in `e2e/contract/`.

## Deploy

Any Node host works (Vercel, a VPS behind Nginx, etc.):

1. `npm ci && npm run build`
2. `NEXT_PUBLIC_SITE_URL=https://your-domain npm start`
3. Ensure the process can write `data/` for contact storage.

No database, analytics or third-party inbox is required.
