# Implementation Plan

Portfolio + private admin CMS for Abdullah Dilshad (AI Automation Engineer).

## Goals

1. Public recruiter/client-facing portfolio
2. Detailed case-study pages
3. Secure private admin portal
4. Database-backed CMS (Supabase)
5. Contact-form storage + optional n8n webhook

## Architecture

```
apps (single Next.js App Router project)
├── app/
│   ├── (public)/          # Marketing layout
│   │   ├── page.tsx
│   │   ├── work/[slug]/
│   │   ├── resume/
│   │   ├── privacy/
│   │   └── contact/       # optional dedicated page
│   ├── admin/
│   │   ├── login/
│   │   ├── (protected)/   # server-guarded shell
│   │   │   ├── page.tsx   # dashboard
│   │   │   ├── case-studies/
│   │   │   ├── media/
│   │   │   ├── messages/
│   │   │   ├── profile/
│   │   │   ├── experience/
│   │   │   ├── capabilities/
│   │   │   ├── templates/
│   │   │   └── settings/
│   ├── api/               # route handlers as needed
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── ui/                # design-system primitives
│   ├── public/            # homepage/sections
│   ├── work/              # case-study presentation
│   └── admin/             # admin shell + editors
├── lib/
│   ├── content/           # seed + types (Phase 1–3)
│   ├── supabase/          # clients (Phase 4+)
│   ├── validations/       # Zod schemas
│   └── auth/              # admin authorization helpers
├── supabase/migrations/   # SQL + RLS (Phase 4)
└── tests/                 # Vitest + Playwright
```

### Data-access layer (Phase 4+)

- Server Components / Server Actions call repository functions in `lib/`
- Browser Supabase client only for auth session + limited admin UX
- Service role never shipped to the client
- Public reads filter `status = 'published'` / `is_published = true`

### Authentication model (Phase 5+)

- Supabase Auth email/password
- No public registration
- Server-side session check on every admin route
- Membership in `authorized_admins` required
- Unauthenticated → `/admin/login`
- Authenticated but unauthorized → denied / redirected

### Storage model (Phase 7)

- Buckets: `media`, `cv` (names finalized in Phase 4 migrations)
- Admin-only writes; public read for published asset URLs only as needed
- File-type + size validation server-side

### Testing strategy

- Vitest: Zod schemas, slug helpers, publish filters, auth helper, file/URL validation
- Playwright: homepage, case study, 404, contact, admin auth gate, draft/publish flow, media upload

---

## Design tokens (Stitch → CSS variables / Tailwind)

Kinetic orange redesign (pre–Phase 5). Former green palette retired.

| Token | Value |
|-------|-------|
| `--surface` / background | `#131313` |
| `--surface-lowest` | `#0e0e0e` |
| `--surface-low` | `#1c1b1b` |
| `--surface-container` | `#201f1f` |
| `--surface-high` | `#2a2a2a` |
| `--surface-highest` | `#353534` |
| `--primary` | `#ff8c37` |
| `--primary-container` | `#ff8c37` |
| `--on-primary` | `#512300` |
| `--on-primary-container` | `#512300` |
| `--secondary` | `#c6c6c7` |
| `--tertiary` | `#c8c6c5` |
| `--on-surface` | `#e5e2e1` |
| `--on-surface-variant` | `#ddc1b2` |
| `--outline` | `#a48c7e` |
| `--outline-variant` | `#564337` |
| `--error` | `#ffb4ab` |
| Max width | `1280px` |
| Desktop margin | `48px` |
| Gutter | `24px` |
| Radius | `1rem` default; pill CTAs |
| Fonts | Geist (display/labels), Inter (body) |

Icons: Lucide React (replace Material Symbols).

---

## Routes

### Public

| Route | Phase |
|-------|-------|
| `/` | 1 placeholder → 2 full |
| `/work/[slug]` | 1 placeholder → 3 full |
| `/resume` | 1 placeholder → later CV serve |
| `/privacy` | 1 placeholder → 8 content |
| `/robots.txt` | 8 |
| `/sitemap.xml` | 8 |

### Admin

| Route | Phase |
|-------|-------|
| `/admin/login` | 1 shell → 5 auth |
| `/admin` | 1 shell → 5/6 |
| `/admin/case-studies` | 1 → 6 |
| `/admin/case-studies/new` | 1 → 6 |
| `/admin/case-studies/[id]/edit` | 1 → 6 |
| `/admin/media` | 1 → 7 |
| `/admin/messages` | 1 → 7 |
| `/admin/profile` | 1 → 6 |
| `/admin/experience` | 1 → 6 |
| `/admin/capabilities` | 1 → 6 |
| `/admin/templates` | 1 → 6 |
| `/admin/settings` | 1 → 6 |

---

## Component hierarchy (Phase 1 foundation)

```
components/ui/
  Button, Badge, Card, Container, Section, SectionHeading
  StatusIndicator, ToolChip, Input, Textarea, Select, Label
  Dialog, Toast, Skeleton
components/public/
  SiteHeader, SiteFooter, MobileNav
components/admin/
  AdminSidebar, AdminTopBar, AdminShell
```

---

## Phases

| Phase | Name | Stop rule |
|-------|------|-----------|
| 0 | Audit and plan | Docs complete; no production UI |
| 1 | Foundation and design system | Lint + types + build pass; tokens + layouts |
| 2 | Public homepage | Visual match + verified content only |
| 3 | Case-study experience | 3 slugs + 404 + reusable components |
| 4 | Supabase data foundation | Migrations, RLS, repos, `.env.example` |
| 5 | Admin authentication and shell | Server-side authz |
| 6 | Admin content management | CRUD + publish flow |
| 7 | Media and contact system | Storage + contact + optional webhook |
| 8 | SEO, performance, security, deployment | Docs + Playwright critical flows |

---

## Missing external assets

- Authentic portrait
- CV PDF binary
- Case-study screenshots / demos
- Optional GitHub URL confirmation
- Production Supabase project + admin user (operator setup)
- Custom domain

## Decisions locked for Phase 1

- Next.js App Router + TypeScript strict + Tailwind
- No Supabase connection yet
- Verified seed content in `lib/content/seed.ts` only
- Lucide icons; no Material Symbols; no Tailwind CDN
