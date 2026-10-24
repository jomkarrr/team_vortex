-- PensionSaarthi — Migration: owner_id + Row Level Security (RLS)
-- Run this in the Supabase SQL Editor AFTER schema.sql + seed.sql.
-- Do NOT just turn on the "Enable RLS" toggle in the dashboard without
-- these policies: RLS on with no policy blocks EVERYONE, including the
-- logged-in user. RLS + the policies below together = owner-only data.
--
-- Rule: every user row carries owner_id = auth.users(id) of the user who
-- created it. Frontend inserts MUST set owner_id to the logged-in user's id
-- (that is the shared contract with Member B — see backend/README.md §3).
-- Seed demo rows have owner_id = NULL, so after this migration nobody can
-- read them from the backend. That is expected and safe: a new logged-in
-- user creates their own profile/application, they never inherit demo data.

-- 1. Add owner_id to every user table (schemes is public reference data,
--    so it gets no owner_id — it gets a public-read policy instead).
alter table public.profiles
  add column if not exists owner_id uuid references auth.users(id);
alter table public.applications
  add column if not exists owner_id uuid references auth.users(id);
alter table public.helper_links
  add column if not exists owner_id uuid references auth.users(id);
alter table public.checklists
  add column if not exists owner_id uuid references auth.users(id);
alter table public.troubleshooter_sessions
  add column if not exists owner_id uuid references auth.users(id);

-- Helpful indexes for the owner lookups (RLS checks run on every query).
create index if not exists profiles_owner_id_idx on public.profiles(owner_id);
create index if not exists applications_owner_id_idx on public.applications(owner_id);
create index if not exists helper_links_owner_id_idx on public.helper_links(owner_id);
create index if not exists checklists_owner_id_idx on public.checklists(owner_id);
create index if not exists troubleshooter_sessions_owner_id_idx on public.troubleshooter_sessions(owner_id);

-- 2. Enable RLS on all 7 tables.
alter table public.schemes enable row level security;
alter table public.profiles enable row level security;
alter table public.helper_links enable row level security;
alter table public.applications enable row level security;
alter table public.application_status_events enable row level security;
alter table public.checklists enable row level security;
alter table public.troubleshooter_sessions enable row level security;

-- 3. Policies — drop first so re-running this file is safe.
drop policy if exists "schemes_public_read" on public.schemes;
drop policy if exists "profiles_owner_all" on public.profiles;
drop policy if exists "helper_links_owner_all" on public.helper_links;
drop policy if exists "applications_owner_all" on public.applications;
drop policy if exists "status_events_owner_read" on public.application_status_events;
drop policy if exists "status_events_owner_insert" on public.application_status_events;
drop policy if exists "checklists_owner_all" on public.checklists;
drop policy if exists "troubleshooter_owner_all" on public.troubleshooter_sessions;

-- schemes: public reference data, anyone (anon or logged in) can read.
-- Nobody writes schemes from the app — only via SQL Editor / seed.
create policy "schemes_public_read" on public.schemes
  for select using (true);

-- User tables: owner can do everything on their own rows, nothing on others'.
-- (For INSERT, "with check" is what enforces owner_id = logged-in user.)
create policy "profiles_owner_all" on public.profiles
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "helper_links_owner_all" on public.helper_links
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "applications_owner_all" on public.applications
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "checklists_owner_all" on public.checklists
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "troubleshooter_owner_all" on public.troubleshooter_sessions
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Status events: append-only history.
-- Owner of the application can READ its events and INSERT new ones.
-- There is deliberately NO update/delete policy: UPDATE/DELETE are denied
-- by RLS even for the owner, so history can never be rewritten.
create policy "status_events_owner_read" on public.application_status_events
  for select using (
    exists (
      select 1 from public.applications a
      where a.id = application_status_events.application_id
        and a.owner_id = auth.uid()
    )
  );
create policy "status_events_owner_insert" on public.application_status_events
  for insert with check (
    exists (
      select 1 from public.applications a
      where a.id = application_status_events.application_id
        and a.owner_id = auth.uid()
    )
  );

-- End of migration. Two-user test after running:
--  User A logs in, creates a profile/application, sees it.
--  User B logs in, queries the same application id, gets 0 rows.
--  If User B sees User A's rows, STOP — do not demo privacy, report it.
