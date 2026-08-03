# Project Progress

## Status legend

- `[ ]` not started
- `[~]` in progress
- `[x]` complete (acceptance criteria passed)
- `[!]` blocked

---

## Phase 0 — Audit and plan

- [x] Complete

**Acceptance:** passed

---

## Phase 1 — Foundation and design system

- [x] Complete

**Acceptance:** passed

---

## Phase 2 — Public homepage

- [x] Complete

**Acceptance:** passed

---

## Phase 3 — Case-study experience

- [x] Complete

**Acceptance:** passed

---

## Phase 4 — Supabase data foundation

- [x] Supabase browser/server/service-role clients
- [x] SQL migration with tables, FKs, indexes, updated-at triggers
- [x] Row Level Security (published-only public reads; private contacts; admin mutations)
- [x] Storage buckets `media` + `cv` with admin-write policies
- [x] Safe SQL seed + `npm run db:seed` script (env-only credentials)
- [x] Zod schemas + publish filters + auth helper
- [x] Repositories with seed fallback when Supabase unset
- [x] Public pages wired through repositories
- [x] `.env.example` + `docs/SUPABASE.md`
- [x] Unit tests for validation/filtering/auth/env detection
- [x] Lint / typecheck / tests / build

**Acceptance:** passed (2026-08-03)

**Commands run:**

```text
npm run lint      → pass
npm run typecheck → pass
npm test          → pass (14 tests)
npm run build     → pass
```

---

## UI redesign (pre–Phase 5)

- [x] Adopt kinetic orange / charcoal Stitch system (`#131313`, vivid `#ff8c37`)
- [x] Redesign public homepage, case studies, nav/footer
- [x] Redesign admin Command Center shell + dashboard
- [x] Preserve `CONTENT_TRUTH.md` (no fabricated Stitch metrics/roles/tools)
- [x] Lint / typecheck / tests / build

**Acceptance:** passed (2026-08-03)

**Commands run:**

```text
npm run lint      → pass
npx tsc --noEmit  → pass
npm test          → pass (14 tests)
npm run build     → pass
```

---

## Phase 5 — Admin authentication and shell

- [x] Supabase email/password login (no public registration UI)
- [x] `authorized_admins` membership check
- [x] Middleware session refresh + unauthenticated `/admin` redirect
- [x] Protected layout `requireAuthorizedAdmin()`
- [x] Logout (server action + `/admin/logout` route)
- [x] Unauthorized / not-configured error states on login
- [x] Docs updated (`docs/SUPABASE.md`, README)
- [x] Vitest coverage for login schema + auth helper
- [x] Lint / typecheck / tests / build

**Acceptance:** passed (2026-08-03)

**Operator setup:** create Auth user → insert UUID into `authorized_admins` → sign in at `/admin/login`.

---

## Phase 6 — Admin content management

- [x] Case study list / create / edit / publish / unpublish / delete
- [x] Nested case-study children sync (steps, tools, reliability, gallery placeholders)
- [x] Profile editor
- [x] Experience CRUD
- [x] Capabilities CRUD
- [x] Public templates CRUD
- [x] Site settings editor
- [x] Dashboard live published/draft counts
- [x] Media + messages left as Phase 7 placeholders
- [x] Vitest coverage for CMS form utils + schemas
- [x] Lint / typecheck / tests / build

**Acceptance:** passed (2026-08-03)

**Note:** Mutations require Supabase + authorized admin session. Nested case-study fields use validated JSON editors.

---

## Phase 7 — Media and contact system

- [x] Contact Server Action (Zod + honeypot + rate limit + service-role insert)
- [x] Optional `N8N_CONTACT_WEBHOOK_URL` notify (non-blocking)
- [x] Admin messages inbox (read / unread / archive / delete)
- [x] Admin media library (image + CV upload/list/delete)
- [x] Link portrait + CV URLs on profile; `/resume` download when CV is set
- [x] Dashboard unread submission count
- [x] Vitest coverage for contact/media/rate-limit helpers
- [x] Docs: `docs/SUPABASE.md` Phase 7 + `npm run db:setup`
- [x] Live Supabase bootstrap (`npm run db:setup`: migration, buckets, seed, admin user)

**Acceptance:** passed (2026-08-03)

---

## Phase 8 — SEO, performance, security, deployment

- [x] `metadataBase`, Open Graph, Twitter, canonicals
- [x] JSON-LD (Person + WebSite)
- [x] `app/sitemap.ts` + `app/robots.ts` (admin disallowed)
- [x] Privacy page content
- [x] Security headers + CSP in `next.config.ts` (`poweredByHeader: false`)
- [x] Optimized hero images via `next/image`
- [x] Playwright critical flows (homepage, case study, 404, robots/sitemap, admin gate)
- [x] Deployment docs (`docs/DEPLOYMENT.md`) + README updates
- [x] Vitest coverage for site URL helpers

**Acceptance:** passed (2026-08-03) — lint / typecheck / 29 unit tests / 5 Playwright flows / build
