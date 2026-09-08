-- ---------------------------------------------------------------------------
-- Makes the remaining hardcoded public sections editable from the admin panel:
--   proof strip, hero workflow visual, header/footer nav, workflow catalog.
--
-- Follows the conventions in 20260803000000_init.sql: set_updated_at triggers,
-- RLS on every table, a public "read published" policy plus an admin-manage
-- policy gated on public.is_authorized_admin().
-- ---------------------------------------------------------------------------

-- Proof strip shown under the hero.
create table if not exists public.proof_points (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label text not null,
  -- Featured rows span the full grid width in the public strip.
  is_featured boolean not null default false,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Steps in the animated hero workflow diagram.
create table if not exists public.hero_workflow_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  -- Name of a lucide-react icon; unknown names fall back at render time.
  icon text not null default 'Webhook',
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Header and footer navigation.
create table if not exists public.nav_links (
  id uuid primary key default gen_random_uuid(),
  href text not null,
  label text not null,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Categories in the workflow catalog.
create table if not exists public.workflow_groups (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text not null default '',
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workflow_groups_category_unique unique (category)
);

-- Individual workflows inside a category.
create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.workflow_groups (id) on delete cascade,
  -- Stable public identifier, kept from the previous hardcoded catalog.
  slug text not null,
  title text not null,
  summary text not null default '',
  outcome_tags text[] not null default '{}',
  is_active boolean not null default true,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workflows_slug_unique unique (slug)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists proof_points_order_idx
  on public.proof_points (display_order);
create index if not exists hero_workflow_steps_order_idx
  on public.hero_workflow_steps (display_order);
create index if not exists nav_links_order_idx
  on public.nav_links (display_order);
create index if not exists workflow_groups_order_idx
  on public.workflow_groups (display_order);
create index if not exists workflows_group_order_idx
  on public.workflows (group_id, display_order);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists proof_points_set_updated_at on public.proof_points;
create trigger proof_points_set_updated_at
  before update on public.proof_points
  for each row execute function public.set_updated_at();

drop trigger if exists hero_workflow_steps_set_updated_at on public.hero_workflow_steps;
create trigger hero_workflow_steps_set_updated_at
  before update on public.hero_workflow_steps
  for each row execute function public.set_updated_at();

drop trigger if exists nav_links_set_updated_at on public.nav_links;
create trigger nav_links_set_updated_at
  before update on public.nav_links
  for each row execute function public.set_updated_at();

drop trigger if exists workflow_groups_set_updated_at on public.workflow_groups;
create trigger workflow_groups_set_updated_at
  before update on public.workflow_groups
  for each row execute function public.set_updated_at();

drop trigger if exists workflows_set_updated_at on public.workflows;
create trigger workflows_set_updated_at
  before update on public.workflows
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.proof_points enable row level security;
alter table public.hero_workflow_steps enable row level security;
alter table public.nav_links enable row level security;
alter table public.workflow_groups enable row level security;
alter table public.workflows enable row level security;

drop policy if exists "Public can read published proof points" on public.proof_points;
create policy "Public can read published proof points"
  on public.proof_points for select
  to anon, authenticated
  using (is_published = true or public.is_authorized_admin());

drop policy if exists "Admins manage proof_points" on public.proof_points;
create policy "Admins manage proof_points"
  on public.proof_points for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

drop policy if exists "Public can read published hero workflow steps" on public.hero_workflow_steps;
create policy "Public can read published hero workflow steps"
  on public.hero_workflow_steps for select
  to anon, authenticated
  using (is_published = true or public.is_authorized_admin());

drop policy if exists "Admins manage hero_workflow_steps" on public.hero_workflow_steps;
create policy "Admins manage hero_workflow_steps"
  on public.hero_workflow_steps for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

drop policy if exists "Public can read published nav links" on public.nav_links;
create policy "Public can read published nav links"
  on public.nav_links for select
  to anon, authenticated
  using (is_published = true or public.is_authorized_admin());

drop policy if exists "Admins manage nav_links" on public.nav_links;
create policy "Admins manage nav_links"
  on public.nav_links for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

drop policy if exists "Public can read published workflow groups" on public.workflow_groups;
create policy "Public can read published workflow groups"
  on public.workflow_groups for select
  to anon, authenticated
  using (is_published = true or public.is_authorized_admin());

drop policy if exists "Admins manage workflow_groups" on public.workflow_groups;
create policy "Admins manage workflow_groups"
  on public.workflow_groups for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

-- A workflow is publicly readable only when its group is published too.
drop policy if exists "Public can read published workflows" on public.workflows;
create policy "Public can read published workflows"
  on public.workflows for select
  to anon, authenticated
  using (
    public.is_authorized_admin()
    or (
      is_published = true
      and exists (
        select 1
        from public.workflow_groups g
        where g.id = workflows.group_id
          and g.is_published = true
      )
    )
  );

drop policy if exists "Admins manage workflows" on public.workflows;
create policy "Admins manage workflows"
  on public.workflows for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());
