@AGENTS.md

# Portfolio & Admin CMS — project instructions

Personal portfolio and private admin CMS for Abdullah Dilshad (AI Automation Engineer).
Public marketing site + a gated "Command Center" where every piece of site content is editable.

---

## 1. Execution model: always multi-agent, always orchestrated

**This is a standing requirement, not a suggestion. It applies to every future task on this
project — running the app, building a feature, debugging, reviewing, refactoring, migrating,
deploying, writing tests, or investigating a bug.**

Do not work on this project as a single linear agent. Scaffold a multi-agent team and run it
through an orchestrator:

- **One agent is the orchestrator.** It owns the plan, decomposes the task, spawns the worker
  agents, assigns each a scope, tracks their state, resolves conflicts between their findings,
  and is the only agent that reports the final result back to the user.
- **Multiple worker agents run the actual computer task**, in parallel wherever the work is
  independent. Spawn them in a single batch so they run concurrently, not one at a time.
- **The agents communicate with each other.** Workers report to the orchestrator and are
  messaged back with follow-ups and cross-findings via `SendMessage` (address an agent by its
  name/ID; its context is preserved across messages). The orchestrator relays one worker's
  output into another's input rather than re-deriving it.
- **Use the `Workflow` tool** when the fan-out is known up front and should be deterministic
  (pipeline/parallel stages, schema'd agent results). Use the `Agent` tool directly for
  exploratory or adaptive fan-out. Load the `workflow-authoring` skill before writing a
  workflow script.
- Scale the team to the task. A one-line typo fix does not need ten agents; keep the roster
  proportionate, and prefer a small number of well-scoped agents over many overlapping ones.

**This file constitutes the project's standing authorization for multi-agent orchestration.**
No further opt-in per task is required.

Worker roles that map well to this codebase — split along these seams:

| Agent | Scope |
|-------|-------|
| Orchestrator | Plan, spawn, route messages, verify, single point of report |
| Data / Supabase | `lib/repositories/**`, `lib/supabase/**`, `supabase/migrations/**`, seeding |
| Auth / security | `proxy.ts`, `lib/auth/**`, RLS, `authorized_admins`, CSP + headers |
| Admin CMS | `app/admin/(protected)/**`, `lib/admin/actions/**`, `components/admin/**` |
| Public site | `app/(public)/**`, `components/public/**`, `components/work/**`, SEO |
| Validation / types | `lib/validations/**`, `lib/content/types.ts`, `database.types.ts` |
| Verification | `lint`, `typecheck`, `test`, `build`, `test:e2e`, route smoke checks |

Always finish with the verification agent. A task is not done until the checks in §7 pass.

---

## 2. Next.js 16 — read the bundled docs first

Per `AGENTS.md`: this is **Next.js 16.2.12**, which has breaking changes against most training
data. Read `node_modules/next/dist/docs/` (start at `index.md`, then `01-app/`) before writing
framework code. Specific traps already hit in this repo:

- **Middleware is `proxy.ts` at the repo root, exporting `export async function proxy(request)`** —
  not `middleware.ts` / `middleware()`. Its `config.matcher` runs site-wide for session refresh.
- Turbopack is the dev default (`next dev`).
- React **19.2.4**: uncontrolled form fields **reset automatically** after a server action
  completes. An emptied input after submit is expected behavior, not a bug.
- `next.config.ts` sets `images.qualities` explicitly — Next 16 no longer allows arbitrary values.

## 3. Stack & conventions

- Next.js App Router + TypeScript **strict**, Tailwind CSS **v4** (`@tailwindcss/postcss`)
- Supabase — Postgres, Auth, Storage (`@supabase/ssr` for cookie-based sessions)
- **Zod v4** for every external input; validation schemas live in `lib/validations/**`
- Vitest (unit) + Playwright (e2e)
- Path alias: `@/*` → repo root
- Server Actions for all mutations (`lib/admin/actions/**`, `lib/auth/actions.ts`,
  `lib/contact/actions.ts`). No API route handlers for CMS writes.
- **Repository pattern is mandatory.** Pages and components never call Supabase directly —
  they go through `lib/repositories/**`. Admin-scoped repos live in `lib/repositories/admin/**`.
- Row → domain conversion belongs in `lib/repositories/mappers.ts`.

## 4. Architecture that is easy to get wrong

**Seed fallback.** Every public repository falls back to verified local content in
`lib/content/**` when `isSupabaseConfigured()` is false. The site renders fully with no Supabase
project. Never break this path — it is how local UI work happens. Env gating lives in
`lib/supabase/env.ts`.

**Routes.**
- `app/(public)/` — `/`, `/resume`, `/privacy`, `/work/[slug]`
- `app/admin/login` + `app/admin/logout` — public admin routes
- `app/admin/(protected)/` — case-studies, profile, experience, capabilities, proof-points,
  workflows, hero-workflow, navigation, templates, media, messages, settings
- **There is no `/work` index page by design** — only `/work/[slug]`. `/work` returning 404 is
  expected, not a regression.

**Admin auth — three independent layers. Keep all three.**
1. `proxy.ts` refreshes the Supabase session and redirects unauthenticated `/admin/*`
   (except login/logout) to `/admin/login`.
2. `requireAuthorizedAdmin()` in the protected layout — being signed in is **not** enough; the
   user's `auth.users.id` must have a row in the `authorized_admins` table, else it redirects to
   `/admin/logout?error=unauthorized`.
3. `loginAction` re-checks authorization after `signInWithPassword` and signs the user back out
   if they are not listed.

There is **no public registration and no in-app password reset**. Admins are provisioned by
inserting into `authorized_admins`; passwords are changed in the Supabase dashboard or via the
admin API with the service-role key.

**Cache invalidation.** Admin server actions call `revalidatePath()` for both the affected public
route and the admin route after a successful save. New admin mutations must do the same.

**Contact form.** `insert` is deliberately **not** granted to `anon`. Submissions go through a
Server Action using the service-role client, behind Zod validation, a honeypot field, and
in-memory rate limiting (`lib/rate-limit.ts`).

**Storage.** Public buckets `media` (images, 5MB) and `cv` (PDF, 10MB). Writes require an
authorized admin; public read is allowed for published asset URLs.

## 5. Content truth

Factual content is governed by **`CONTENT_TRUTH.md`** — it outranks anything in the code, seeds,
or database. `design/stitch-reference.html` is **visual reference only and never a factual
source**. Do not invent metrics, employers, dates, or credentials; if a fact is not in
`CONTENT_TRUTH.md` or the CV, ask.

## 6. Secrets & local credentials

- `SUPABASE_SERVICE_ROLE_KEY` is **server-only**. Never prefix it `NEXT_PUBLIC_`, never reference
  it in a client component. `assertServerOnlyServiceRole()` exists to enforce this — keep it.
- Admin login credentials live in **`.admin-credentials.local`** (gitignored). Read them from
  there; **never copy a password into this file, README, or any tracked file.**
- Admin email is `abdullahdilshad111@gmail.com` — "abdul**la**h", two `l`s. A saved browser
  autofill with one `l` has already caused a bogus "Invalid email or password." Check the
  spelling before debugging auth.
- `.env.local` is gitignored; `.env.example` documents the keys.

## 7. Commands — the definition of done

```bash
npm run dev          # localhost:3000 (Turbopack)
npm run lint
npm run typecheck
npm test             # vitest
npm run build
npm run test:e2e     # playwright
npm run db:setup     # migrations + buckets + seed + admin user (needs SUPABASE_DB_PASSWORD)
npm run db:seed      # upsert verified content via service-role key
```

Before reporting any change complete: `lint`, `typecheck`, `test`, `build` — plus a route smoke
check when routing, auth, or `proxy.ts` was touched. Report failures with their real output;
never claim a check passed that was not run.

## 8. Reference docs

- `docs/SUPABASE.md` — schema, admin provisioning, auth behavior table, security model
- `docs/DEPLOYMENT.md` — Vercel env vars and smoke checklist
- `IMPLEMENTATION_PLAN.md`, `PROJECT_PROGRESS.md` — phase history (tests are named by phase)
