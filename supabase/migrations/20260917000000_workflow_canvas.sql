-- ---------------------------------------------------------------------------
-- Lets each workflow carry a rendered n8n canvas.
--
-- An admin pastes raw n8n workflow JSON into the CMS. The paste is kept
-- verbatim in canvas_source so the editor can re-open and re-edit exactly what
-- was submitted; the parsed, render-ready WorkflowCanvas (see
-- lib/workflow-canvas/types.ts) is stored in canvas_json and is the only shape
-- the public canvas component ever reads.
--
-- Both columns are nullable with no backfill: when canvas_json is null the
-- public catalog keeps rendering exactly as it does today (image, or the
-- deterministic generated glyph), so existing rows need no migration.
--
-- No new RLS policy is required. Both columns live on public.workflows, whose
-- policies from 20260908000000_editable_site_content.sql are row-scoped, not
-- column-scoped:
--   * "Public can read published workflows" grants select to anon/authenticated
--     for published rows in a published group — canvas data is therefore public
--     exactly when the rest of that workflow row already is.
--   * "Admins manage workflows" grants all to authenticated callers passing
--     public.is_authorized_admin() — so writes stay admin-only.
-- Adding columns to the table inherits both automatically.
-- ---------------------------------------------------------------------------

alter table public.workflows
  add column if not exists canvas_json jsonb;

alter table public.workflows
  add column if not exists canvas_source text;
