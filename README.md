# Abdullah Dilshad — Portfolio & Admin CMS

Production portfolio and private admin CMS for Abdullah Dilshad (AI Automation Engineer).

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS v4
- Supabase PostgreSQL / Auth / Storage
- Zod validation + repository data access
- Vitest + Playwright

## Content truth

Factual content is governed by [`CONTENT_TRUTH.md`](./CONTENT_TRUTH.md). Stitch HTML is visual reference only — see [`design/stitch-reference.html`](./design/stitch-reference.html).

## Development

```bash
npm install
npm run dev
```

Public pages work without Supabase by falling back to verified local seed data.

Optional live data: copy `.env.example` → `.env.local`, set `SUPABASE_DB_PASSWORD`, then `npm run db:setup`.  
That applies migrations, seeds content, creates storage buckets, and provisions the admin user.  
See [`docs/SUPABASE.md`](./docs/SUPABASE.md).

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Deployment

See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for Vercel env vars and smoke checklist.

## Phase status

See [`PROJECT_PROGRESS.md`](./PROJECT_PROGRESS.md) and [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).
