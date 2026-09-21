-- ---------------------------------------------------------------------------
-- Drops the hero workflow diagram table.
--
-- The public "How it runs" section — the five-step runnable pipeline schematic
-- that sat under the hero (Business Trigger -> Data Enrichment -> AI-Assisted
-- Decision -> Human Approval -> Business Action), with its approval pause and
-- failure-injection toggle — has been removed from the site. With that section
-- gone the table has no readers at all:
--
--   * components/public/workflow-visual.tsx and workflow-runner.tsx, the only
--     public consumers, were removed.
--   * lib/repositories/site-content.ts no longer exports
--     listPublishedHeroWorkflowSteps, the sole published-read path.
--   * The CMS surface that wrote to it is gone too: /admin/hero-workflow,
--     components/admin/hero-workflow-manager.tsx, the save/delete server
--     actions in lib/admin/actions/site-content.ts, and the four
--     createAdminHeroWorkflowStep/... repository functions.
--   * lib/content/seed.ts no longer defines heroWorkflowSeed, so
--     scripts/seed-supabase.ts no longer repopulates the table.
--
-- DATA LOST: every row in public.hero_workflow_steps — the admin-edited step
-- titles, descriptions, lucide icon names, display_order and is_published
-- flags. This is content-only; nothing references these rows by foreign key,
-- so no other table is affected and no cascade is needed. The five seeded
-- steps are recoverable from git history (lib/content/seed.ts, heroWorkflowSeed)
-- and from local/removed/workflow-runner/, but any step an admin added or
-- reworded through the CMS after seeding exists only in this table and is
-- gone for good once this runs. Snapshot the table first if that copy matters:
--   select * from public.hero_workflow_steps order by display_order;
--
-- Order below is dependency-correct: policies and the trigger are dropped
-- before the table they attach to, so the migration reads cleanly and stays
-- re-runnable. (Strictly, "drop table" would remove all three implicitly —
-- they are named explicitly so this file documents exactly what 20260908000000
-- created and is being undone.) The index hero_workflow_steps_order_idx and
-- the table's RLS enablement go with the table itself. public.set_updated_at()
-- is shared by the other content tables and is deliberately left in place.
-- ---------------------------------------------------------------------------

-- RLS policies (created in 20260908000000_editable_site_content.sql).
drop policy if exists "Public can read published hero workflow steps"
  on public.hero_workflow_steps;
drop policy if exists "Admins manage hero_workflow_steps"
  on public.hero_workflow_steps;

-- updated_at trigger, before the table it fires on.
drop trigger if exists hero_workflow_steps_set_updated_at
  on public.hero_workflow_steps;

-- The table, its index and its RLS configuration.
drop table if exists public.hero_workflow_steps;
