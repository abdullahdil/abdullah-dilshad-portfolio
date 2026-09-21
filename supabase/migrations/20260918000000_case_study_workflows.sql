-- ---------------------------------------------------------------------------
-- Lets a case study show the workflows it was built from.
--
-- A case study narrates an outcome; the workflow catalog already holds the
-- rendered n8n canvases (public.workflows.canvas_json, added in
-- 20260917000000_workflow_canvas.sql). This join table is the link between the
-- two, so a case-study page can display the real canvases instead of a second,
-- hand-maintained copy of the same diagrams.
--
-- It is a link table only: no title, summary or canvas is denormalized here.
-- The workflow row stays the single source of truth, so re-pasting a canvas in
-- the CMS updates every case study that references it, with no second edit.
--
-- display_order is authored per case study rather than inherited from
-- workflows.display_order, because the order that reads well inside one
-- narrative is not the catalog's order.
--
-- RLS consequences — this table joins two independently gated things, so the
-- public select policy has to satisfy BOTH gates or it would leak the existence
-- of a draft case study or an unpublished workflow:
--   * the parent case study must be published, mirroring the nested-exists
--     style of "Public can read steps for published case studies"
--     (20260803000000_init.sql);
--   * the referenced workflow must itself be publicly readable, which means
--     published AND in a published group — the same two-level condition as
--     "Public can read published workflows"
--     (20260908000000_editable_site_content.sql).
-- A link whose workflow later goes unpublished therefore stops being visible
-- without the row being deleted, and the public repository simply renders one
-- fewer preview. Writes stay admin-only via public.is_authorized_admin().
-- ---------------------------------------------------------------------------

create table if not exists public.case_study_workflows (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references public.case_studies (id) on delete cascade,
  workflow_id uuid not null references public.workflows (id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  constraint case_study_workflows_unique_pair unique (case_study_id, workflow_id)
);

create index if not exists case_study_workflows_case_study_id_idx
  on public.case_study_workflows (case_study_id, display_order);

alter table public.case_study_workflows enable row level security;

drop policy if exists "Public can read workflow links for published case studies"
  on public.case_study_workflows;
create policy "Public can read workflow links for published case studies"
  on public.case_study_workflows for select
  to anon, authenticated
  using (
    public.is_authorized_admin()
    or (
      exists (
        select 1 from public.case_studies cs
        where cs.id = case_study_workflows.case_study_id
          and cs.status = 'published'
      )
      and exists (
        select 1
        from public.workflows w
        join public.workflow_groups g on g.id = w.group_id
        where w.id = case_study_workflows.workflow_id
          and w.is_published = true
          and g.is_published = true
      )
    )
  );

drop policy if exists "Admins manage case_study_workflows"
  on public.case_study_workflows;
create policy "Admins manage case_study_workflows"
  on public.case_study_workflows for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());
