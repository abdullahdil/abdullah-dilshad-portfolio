-- ---------------------------------------------------------------------------
-- Adds Instagram and X (formerly Twitter) profile links.
--
-- public.profile already carries linkedin_url, github_url, n8n_profile_url and
-- credential_url (20260803000000_init.sql). These two columns mirror those
-- exactly: plain nullable text, no constraint, no default, no backfill. A null
-- simply means "this social is not published" — components/public/social-links.tsx
-- renders only the socials that have a URL, so existing rows need no migration
-- and the header keeps rendering exactly as it does today until an admin fills
-- the fields in the CMS (or `npm run db:seed` writes the verified seed values).
--
-- No new RLS policy is required. Both columns live on public.profile, whose
-- policies from 20260803000000_init.sql / 20260908000000_editable_site_content.sql
-- are row-scoped, not column-scoped:
--   * the public read policy grants select on the profile row to anon /
--     authenticated, so these URLs are public exactly as linkedin_url already is
--     — which is the intent: they are links meant to be clicked by visitors.
--   * the admin policy grants all to authenticated callers passing
--     public.is_authorized_admin(), so writes stay admin-only.
-- Adding columns to the table inherits both automatically.
-- ---------------------------------------------------------------------------

alter table public.profile
  add column if not exists instagram_url text;

alter table public.profile
  add column if not exists x_url text;
