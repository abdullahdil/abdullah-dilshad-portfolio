# Supabase setup

This project uses Supabase for PostgreSQL, Auth, and Storage. Public pages fall back to verified local seed content when Supabase env vars are missing, so local UI development works without a project.

## 1. Create a project

1. Create a Supabase project.
2. Copy the project URL and anon key.
3. Copy the service role key (server-only).

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Required for live data:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never ship to the browser)

## 3. One-command bootstrap (recommended)

Add the database password to `.env.local` (Project Settings → Database):

```bash
SUPABASE_DB_PASSWORD=your-postgres-password
```

Then:

```bash
npm run db:setup
```

This applies `supabase/migrations/20260803000000_init.sql`, creates `media` + `cv` buckets, seeds verified content, creates the admin Auth user (`abdullahdilshad111@gmail.com`), inserts `authorized_admins`, and writes `.admin-credentials.local` when a new password is generated.

### Manual alternative

1. Run `supabase/migrations/20260803000000_init.sql` in the dashboard SQL editor.
2. `npm run db:seed`
3. Create the Auth user + `authorized_admins` row (or re-run `npm run db:setup` once the DB password is set).

`npm run db:seed` uses the service-role key from `.env.local` and upserts verified content from `lib/content/*`.

## 4. Authorize an admin user (Phase 5)

`npm run db:setup` handles this. Manual path:

1. In the Supabase dashboard, disable public sign-ups (Authentication → Providers / settings) if available.
2. Create a single user in **Authentication → Users** (email/password). Do **not** add an in-app registration flow.
3. Copy the user’s UUID and insert it into `authorized_admins`:

```sql
insert into public.authorized_admins (user_id)
values ('00000000-0000-0000-0000-000000000000'); -- replace with auth.users.id
```

4. Sign in at `/admin/login`.

### Auth behavior

| State | Result |
|-------|--------|
| No Supabase env | `/admin/*` redirects to login with setup message |
| Wrong password | Login error |
| Valid Auth user, not in `authorized_admins` | Signed out; denied message |
| Valid Auth user in `authorized_admins` | Access to Command Center |

Protection layers:

- `middleware.ts` — session refresh + unauthenticated redirect for `/admin/*` (except login/logout)
- `requireAuthorizedAdmin()` in the protected layout — `authorized_admins` membership
- Server Actions — `loginAction` / `logoutAction`

## 5. Admin CMS (Phase 6)

After auth works, content can be managed at:

| Route | Purpose |
|-------|---------|
| `/admin/case-studies` | List, publish, delete |
| `/admin/case-studies/new` | Create |
| `/admin/case-studies/[id]/edit` | Edit + nested JSON |
| `/admin/profile` | Hero / bio / links |
| `/admin/experience` | Roles |
| `/admin/capabilities` | Skills |
| `/admin/templates` | Public n8n templates |
| `/admin/settings` | Availability + notes |

Public pages revalidate after saves. Keep factual content aligned with `CONTENT_TRUTH.md`.

## 6. Storage

Migrations create public buckets:

- `media` — images (jpeg/png/webp/gif, 5MB)
- `cv` — PDF only (10MB)

Writes require an authorized admin. Public read is allowed for published asset URLs.

## 7. Security model (summary)

| Resource | Public | Authorized admin |
|----------|--------|------------------|
| Published case studies + children | read | read/write |
| Draft/archived case studies | denied | read/write |
| Experience / capabilities / templates (`is_published`) | read published | read/write |
| Contact submissions | no read / no direct insert | read/update/delete |
| Profile / site settings | read | write |
| Storage objects | read | write/delete |

Contact inserts are intentionally **not** granted to `anon`. Public contact uses a Server Action with the service-role client after Zod validation, honeypot, and in-memory rate limiting.

Optional webhook (server-only):

```bash
N8N_CONTACT_WEBHOOK_URL=https://your-n8n-instance/webhook/...
```

## 8. Media + contact (Phase 7)

| Surface | Behavior |
|---------|----------|
| `/#contact` | Server Action → `contact_submissions` (+ optional n8n webhook) |
| `/admin/messages` | Inbox: mark read/unread/archive, delete |
| `/admin/media` | Upload/list/delete Storage objects; link portrait + CV |
| `/resume` | Download button when `profile.cv_url` is an http(s) PDF URL |

## 9. Local development without Supabase

Leave `.env.local` unset (or keep placeholder values). Repositories detect missing/placeholder config via `isSupabaseConfigured()` and serve verified seed data. Contact submit returns a clear “not configured” error and points to email.
