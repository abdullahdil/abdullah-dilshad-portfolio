# Deployment

Recommended host: **Vercel** (Next.js App Router).

## 1. Prerequisites

1. Supabase project bootstrapped (`npm run db:setup` locally, or apply migration + seed manually).
2. Production site URL decided (custom domain or `*.vercel.app`).
3. Service-role key kept server-only (never `NEXT_PUBLIC_`).

## 2. Environment variables (Vercel)

Set these in **Project → Settings → Environment Variables** (Production + Preview as needed):

| Variable | Public? | Notes |
|----------|---------|--------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical origin, no trailing slash (e.g. `https://yourdomain.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Server-only; contact inserts + privileged ops |
| `N8N_CONTACT_WEBHOOK_URL` | **No** | Optional contact webhook |
| `SUPABASE_DB_PASSWORD` | **No** | Not required at runtime; only for local/ops `db:setup` |

## 3. Deploy

```bash
# From the repo root (with Vercel CLI), or connect the GitHub repo in the Vercel dashboard
npx vercel
```

Build command: `npm run build`  
Output: Next.js default (no static export).

After the first production deploy:

1. Confirm `NEXT_PUBLIC_SITE_URL` matches the live origin.
2. In Supabase Auth → URL configuration, add the production site URL and `/admin/login` redirect allowlist as needed.
3. Open `/`, `/work/<slug>`, `/robots.txt`, `/sitemap.xml`, `/admin/login`.

## 4. Post-deploy smoke checklist

- [ ] Homepage renders verified content
- [ ] Case study pages resolve; unknown slug → 404
- [ ] Contact form submits (appears in `/admin/messages`)
- [ ] Unauthenticated `/admin` redirects to `/admin/login`
- [ ] Authorized admin can edit content and upload media
- [ ] `/resume` shows CV download when a PDF is linked
- [ ] Response headers include `X-Frame-Options` / CSP (see `next.config.ts`)

## 5. Security notes

- Disable public Auth sign-ups in Supabase.
- Keep only authorized emails in `authorized_admins`.
- Rotate any keys that were pasted into chat or committed by mistake.
- Do not commit `.env.local` or `.admin-credentials.local`.
