-- Abdullah Dilshad portfolio CMS schema
-- Reproducible baseline: tables, indexes, triggers, RLS, storage

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.authorized_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

-- Depends on authorized_admins existing (SQL functions validate relations at create time)
create or replace function public.is_authorized_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.authorized_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_authorized_admin() from public;
grant execute on function public.is_authorized_admin() to authenticated, service_role;

create table public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  professional_title text not null,
  hero_headline text not null,
  hero_description text not null,
  short_bio text not null default '',
  long_bio text[] not null default '{}',
  location text not null,
  availability_status text not null default 'available'
    check (availability_status in ('available', 'limited', 'unavailable')),
  availability_label text not null default 'Available for Remote Work',
  email text not null,
  linkedin_url text,
  github_url text,
  n8n_profile_url text,
  credential_url text,
  cv_url text,
  portrait_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profile_email_unique unique (email)
);

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  summary text not null,
  client_label text,
  industry text,
  confidentiality_label text,
  business_problem text not null default '',
  before_state text not null default '',
  before_issues jsonb not null default '[]'::jsonb,
  architecture_description text not null default '',
  architecture_nodes jsonb not null default '[]'::jsonb,
  contribution jsonb not null default '[]'::jsonb,
  result text not null default '',
  accent text not null default 'primary'
    check (accent in ('primary', 'secondary', 'tertiary')),
  preview_label text not null default 'Architecture preview',
  featured_image_url text,
  demo_video_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint case_studies_slug_unique unique (slug)
);

create table public.case_study_steps (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references public.case_studies (id) on delete cascade,
  step_number integer not null check (step_number > 0),
  title text not null,
  description text not null default '',
  constraint case_study_steps_unique_number unique (case_study_id, step_number)
);

create table public.case_study_tools (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references public.case_studies (id) on delete cascade,
  name text not null,
  category text,
  display_order integer not null default 0
);

create table public.reliability_controls (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references public.case_studies (id) on delete cascade,
  name text not null,
  description text not null default '',
  display_order integer not null default 0
);

create table public.case_study_media (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references public.case_studies (id) on delete cascade,
  media_type text not null
    check (media_type in ('image', 'video', 'embed', 'placeholder')),
  storage_path text,
  external_url text,
  thumbnail_url text,
  alt_text text not null default '',
  caption text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.experience (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  role text not null,
  location text not null default '',
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  description text not null default '',
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.capabilities (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  description text not null default '',
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.public_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  external_url text not null,
  preview_image_url text,
  engagement_count integer,
  tools text[] not null default '{}',
  accent text not null default 'primary'
    check (accent in ('primary', 'secondary', 'tertiary')),
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  opportunity_type text not null,
  message text not null,
  status text not null default 'unread'
    check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null,
  setting_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint site_settings_key_unique unique (setting_key)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index case_studies_status_display_order_idx
  on public.case_studies (status, display_order);

create index case_studies_published_at_idx
  on public.case_studies (published_at desc nulls last);

create index case_study_steps_case_study_id_idx
  on public.case_study_steps (case_study_id, step_number);

create index case_study_tools_case_study_id_idx
  on public.case_study_tools (case_study_id, display_order);

create index reliability_controls_case_study_id_idx
  on public.reliability_controls (case_study_id, display_order);

create index case_study_media_case_study_id_idx
  on public.case_study_media (case_study_id, display_order);

create index experience_published_order_idx
  on public.experience (is_published, display_order);

create index capabilities_published_order_idx
  on public.capabilities (is_published, display_order, category);

create index public_templates_published_order_idx
  on public.public_templates (is_published, display_order);

create index contact_submissions_status_created_idx
  on public.contact_submissions (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Updated-at triggers
-- ---------------------------------------------------------------------------

create trigger profile_set_updated_at
  before update on public.profile
  for each row execute function public.set_updated_at();

create trigger case_studies_set_updated_at
  before update on public.case_studies
  for each row execute function public.set_updated_at();

create trigger experience_set_updated_at
  before update on public.experience
  for each row execute function public.set_updated_at();

create trigger capabilities_set_updated_at
  before update on public.capabilities
  for each row execute function public.set_updated_at();

create trigger public_templates_set_updated_at
  before update on public.public_templates
  for each row execute function public.set_updated_at();

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.authorized_admins enable row level security;
alter table public.profile enable row level security;
alter table public.case_studies enable row level security;
alter table public.case_study_steps enable row level security;
alter table public.case_study_tools enable row level security;
alter table public.reliability_controls enable row level security;
alter table public.case_study_media enable row level security;
alter table public.experience enable row level security;
alter table public.capabilities enable row level security;
alter table public.public_templates enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.site_settings enable row level security;

-- authorized_admins: only admins can read membership; no public insert
create policy "Admins can read authorized_admins"
  on public.authorized_admins for select
  to authenticated
  using (public.is_authorized_admin());

create policy "Admins can manage authorized_admins"
  on public.authorized_admins for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

-- profile
create policy "Public can read profile"
  on public.profile for select
  to anon, authenticated
  using (true);

create policy "Admins can manage profile"
  on public.profile for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

-- case studies: public sees published only
create policy "Public can read published case studies"
  on public.case_studies for select
  to anon, authenticated
  using (
    status = 'published'
    or public.is_authorized_admin()
  );

create policy "Admins can insert case studies"
  on public.case_studies for insert
  to authenticated
  with check (public.is_authorized_admin());

create policy "Admins can update case studies"
  on public.case_studies for update
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

create policy "Admins can delete case studies"
  on public.case_studies for delete
  to authenticated
  using (public.is_authorized_admin());

-- Child tables: readable when parent is published (or admin)
create policy "Public can read steps for published case studies"
  on public.case_study_steps for select
  to anon, authenticated
  using (
    public.is_authorized_admin()
    or exists (
      select 1 from public.case_studies cs
      where cs.id = case_study_id and cs.status = 'published'
    )
  );

create policy "Admins manage case_study_steps"
  on public.case_study_steps for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

create policy "Public can read tools for published case studies"
  on public.case_study_tools for select
  to anon, authenticated
  using (
    public.is_authorized_admin()
    or exists (
      select 1 from public.case_studies cs
      where cs.id = case_study_id and cs.status = 'published'
    )
  );

create policy "Admins manage case_study_tools"
  on public.case_study_tools for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

create policy "Public can read reliability for published case studies"
  on public.reliability_controls for select
  to anon, authenticated
  using (
    public.is_authorized_admin()
    or exists (
      select 1 from public.case_studies cs
      where cs.id = case_study_id and cs.status = 'published'
    )
  );

create policy "Admins manage reliability_controls"
  on public.reliability_controls for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

create policy "Public can read media for published case studies"
  on public.case_study_media for select
  to anon, authenticated
  using (
    public.is_authorized_admin()
    or exists (
      select 1 from public.case_studies cs
      where cs.id = case_study_id and cs.status = 'published'
    )
  );

create policy "Admins manage case_study_media"
  on public.case_study_media for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

-- experience / capabilities / templates
create policy "Public can read published experience"
  on public.experience for select
  to anon, authenticated
  using (is_published = true or public.is_authorized_admin());

create policy "Admins manage experience"
  on public.experience for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

create policy "Public can read published capabilities"
  on public.capabilities for select
  to anon, authenticated
  using (is_published = true or public.is_authorized_admin());

create policy "Admins manage capabilities"
  on public.capabilities for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

create policy "Public can read published templates"
  on public.public_templates for select
  to anon, authenticated
  using (is_published = true or public.is_authorized_admin());

create policy "Admins manage public_templates"
  on public.public_templates for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

-- contact submissions: no public read; insert via service role / server only
-- Deny anon/authenticated direct inserts; Server Action will use service role.
create policy "Admins can read contact submissions"
  on public.contact_submissions for select
  to authenticated
  using (public.is_authorized_admin());

create policy "Admins can update contact submissions"
  on public.contact_submissions for update
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

create policy "Admins can delete contact submissions"
  on public.contact_submissions for delete
  to authenticated
  using (public.is_authorized_admin());

-- site settings: public can read non-sensitive keys later; for now admin write, public read
create policy "Public can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Admins manage site settings"
  on public.site_settings for all
  to authenticated
  using (public.is_authorized_admin())
  with check (public.is_authorized_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets + policies
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'media',
    'media',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'cv',
    'cv',
    true,
    10485760,
    array['application/pdf']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read media bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "Public can read cv bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'cv');

create policy "Admins can upload media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('media', 'cv')
    and public.is_authorized_admin()
  );

create policy "Admins can update media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('media', 'cv')
    and public.is_authorized_admin()
  )
  with check (
    bucket_id in ('media', 'cv')
    and public.is_authorized_admin()
  );

create policy "Admins can delete media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('media', 'cv')
    and public.is_authorized_admin()
  );
