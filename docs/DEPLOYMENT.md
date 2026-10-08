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
| `RESEND_API_KEY` | **No** | Server-only; emails each contact submission to the owner |
| `CONTACT_NOTIFY_EMAIL` | **No** | Recipient (default: profile email `abdullahdilshad111@gmail.com`) |
| `CONTACT_FROM_EMAIL` | **No** | Sender (default `Portfolio Contact <onboarding@resend.dev>`) |
| `N8N_CONTACT_WEBHOOK_URL` | **No** | Optional contact webhook |
| `SUPABASE_DB_PASSWORD` | **No** | Not required at runtime; only for local/ops `db:setup` |

### Contact email

Contact submissions are delivered on two channels at once: the Supabase
`contact_submissions` table (admin inbox) and an email via Resend. The form
reports success if either lands; it fails only if both do.

1. Sign up at [resend.com](https://resend.com) **with the notify address**
   (`abdullahdilshad111@gmail.com`) and create an API key → `RESEND_API_KEY`.
2. With the default `onboarding@resend.dev` sender, Resend only delivers to the
   account owner's own address, so the notify address must match the account.
3. For a custom sender (e.g. `contact@yourdomain.com`) or a different
   recipient, verify the domain in Resend and set `CONTACT_FROM_EMAIL`.
4. Replies go straight to the visitor (`reply_to` is their address).

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
- [ ] Contact form submits (appears in `/admin/messages` and arrives by email)
- [ ] Unauthenticated `/admin` redirects to `/admin/login`
- [ ] Authorized admin can edit content and upload media
- [ ] `/resume` shows CV download when a PDF is linked
- [ ] Response headers include `X-Frame-Options` / CSP (see `next.config.ts`)

## 5. Security notes

- Disable public Auth sign-ups in Supabase.
- Keep only authorized emails in `authorized_admins`.
- Rotate any keys that were pasted into chat or committed by mistake.
- Do not commit `.env.local` or `.admin-credentials.local`.
