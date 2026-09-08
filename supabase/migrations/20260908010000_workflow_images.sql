-- ---------------------------------------------------------------------------
-- Lets each workflow carry an uploaded image.
--
-- When image_url is null the public catalog keeps rendering the deterministic
-- generated glyph, so existing rows need no backfill.
-- ---------------------------------------------------------------------------

alter table public.workflows
  add column if not exists image_url text;

alter table public.workflows
  add column if not exists image_alt text not null default '';
