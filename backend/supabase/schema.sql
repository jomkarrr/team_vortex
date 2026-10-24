-- PensionSaarthi — Supabase schema (Postgres)
-- Run this in the Supabase SQL Editor. Then run seed.sql.
-- Design notes:
--  * We NEVER store a full Aadhaar number. Only aadhaar_last4 if needed.
--  * One pensioner can be helped by many family helpers, and one helper can
--    help many pensioners -> helper_links is the Family Helper Mode table.
--  * Status is an append-only event log, so the full history is auditable
--    (exactly like a real DBT / UMANG status feed would be).

create table if not exists public.schemes (
  id text primary key,               -- matches src/data/schemes.js ids
  name text not null,
  level text not null,               -- Central | State | Contributory
  category text not null,
  amount_note text,
  rules jsonb not null default '{}'::jsonb,
  documents text[] not null default '{}',
  apply_where text,
  source text,
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  age int check (age between 0 and 120),
  state text,
  is_bpl boolean default false,
  is_widow boolean default false,
  disability_percent int default 0 check (disability_percent between 0 and 100),
  worker_type text default 'none' check (worker_type in ('none','unorganised','formal')),
  monthly_income int default 0,
  is_taxpayer boolean default false,
  receiving_pension boolean default false,
  aadhaar_last4 char(4),
  created_at timestamptz not null default now()
);

create table if not exists public.helper_links (
  id uuid primary key default gen_random_uuid(),
  helper_name text not null,          -- e.g. the son / daughter helping
  helper_phone text,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  relation text,                      -- son / daughter / neighbour / CSC operator
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id text primary key,                -- human-readable no, e.g. APP-2026-1001
  profile_id uuid references public.profiles(id) on delete set null,
  scheme_id text references public.schemes(id),
  scheme_name text not null,
  applied_on date not null default current_date,
  current_status text not null default 'Applied'
    check (current_status in ('Applied','Verified','Approved','DBT Sent','Credited','Failed')),
  problem text,
  created_at timestamptz not null default now()
);

create table if not exists public.application_status_events (
  id bigserial primary key,
  application_id text not null references public.applications(id) on delete cascade,
  status text not null,
  event_date date,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  scheme_id text not null references public.schemes(id),
  document text not null,
  is_ready boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (profile_id, scheme_id, document)
);

create table if not exists public.troubleshooter_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  issue_id text not null,             -- matches src/data/troubleshooter.js ids
  resolved boolean default false,
  created_at timestamptz not null default now()
);

-- Hackathon note: RLS is enabled in production with per-helper policies.
-- For the 24h demo, keep the project private and use the anon key only
-- for reads of schemes/status; writes go through the app with demo data.
