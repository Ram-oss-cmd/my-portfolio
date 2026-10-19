# Shreeram Chaudhary — portfolio

A one-page editorial portfolio: warm ivory paper, cobalt, vermilion and lime;
Instrument Serif for display type, Inter for the interface, Noto Sans Devanagari
for the Nepali name. Sections: hero, about, selected work, stack and contact.

The work section is factual: Selang Small Hydropower Project (plant management),
Abhiyan Engineering Nepal (budget and HR systems), Temke Investment Pvt. Ltd.
(loan and audit systems, with a live sample calculator) and the automated water
cannon (a team project with a reserved space for the next prototype). Project
images live in `public/work/`.

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, GSAP + ScrollTrigger, Lenis
and Zustand. No analytics and no external services.

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

## Edit content

Visitor-facing copy lives in `src/data/content.ts`. Components read from it for
the name, intro, about text, stack groups, loan sample and contact details.
Project layouts are composed in `src/components/Work.tsx` so each project can
keep its own shape.

Contact: `contact.email` is `rc.cloop@gmail.com`.

To change a project image, replace the file in `public/work/` and update its
`width`/`height` in `src/components/Work.tsx` if the aspect ratio changes.

The loan calculator is deliberately sample data (NPR 250,000 / 12.5% / 24
months) and is labelled “Sample data, not client data”.

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
UI specs cover the hero and navigation, images, the record/replay control, the
loan calculator, contact form, 404, reduced motion and axe.

## Deploy

Any Node host works (Vercel, a VPS behind Nginx, etc.):

1. `npm ci && npm run build`
2. `NEXT_PUBLIC_SITE_URL=https://your-domain npm start`
3. Ensure the process can write `data/` for contact storage.

No database, analytics or third-party inbox is required.
