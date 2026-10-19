# DECISIONS

| # | Decision | Reason | Owner | Date |
|---|----------|--------|-------|------|
| D-01 | Reuse existing scaffold at `shreeram-portfolio/` instead of re-running create-next-app | Project already scaffolded with Next 16.4.2 and all required deps installed; no work lost | lead | 2026-10-19 |
| D-02 | Next.js 16.4.2 with cacheComponents + partialPrefetching enabled | Created by the official scaffolder; AGENTS.md warns APIs differ from older Next — read `node_modules/next/dist/docs/` before coding | lead | 2026-10-19 |
| D-03 | Contact messages stored in `data/messages.jsonl` (git-ignored); no external services | Brief forbids external services by default; email optional via env only | lead | 2026-10-19 |
