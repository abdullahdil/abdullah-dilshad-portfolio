-- ---------------------------------------------------------------------------
-- "Request Access" per workflow.
--
-- Workflow JSON is never uploaded to or served by the site. A visitor asks for
-- a workflow export, the request lands here, and the owner replies by hand.
-- Email delivery is deliberately not wired yet, so this table IS the delivery
-- mechanism: if the row is not stored, the owner never learns about the request.
--
-- workflow_id holds the public workflow listing id (a slug string), not a uuid
-- FK, because workflow listings come from seed content as well as the database.
-- workflow_title is denormalized on purpose so the admin inbox reads standalone.
-- ---------------------------------------------------------------------------

create table if not exists public.workflow_access_requests (
  id uuid primary key default gen_random_uuid(),
  workflow_id text not null,
  workflow_title text not null,
  name text not null,
  email text not null,
  company text,
  note text,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'declined', 'archived')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists workflow_access_requests_status_created_idx
  on public.workflow_access_requests (status, created_at desc);

alter table public.workflow_access_requests enable row level security;

-- workflow access requests: no public read; insert via service role / server only
-- Deny anon/authenticated direct inserts; Server Action will use service role.
drop policy if exists "Admins can read workflow access requests"
  on public.workflow_access_requests;
create policy "Admins can read workflow access requests"
  on public.workflow_access_requests for select
  to authenticated
  using (public.is_authorized_admin());

drop policy if exists "Admins can update workflow access requests"
  on public.workflow_access_requests;
create policy "Admins can update workflow access requests"
  on public.workflow_access_requests for update
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

drop policy if exists "Admins can delete workflow access requests"
  on public.workflow_access_requests;
create policy "Admins can delete workflow access requests"
  on public.workflow_access_requests for delete
  to authenticated
  using (public.is_authorized_admin());
