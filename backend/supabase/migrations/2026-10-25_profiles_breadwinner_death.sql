-- PensionSaarthi — Migration: breadwinner_death column on profiles
-- Run this in the Supabase SQL Editor AFTER schema.sql, seed.sql and the
-- 2026-10-24_owner_id_rls.sql migration.
--
-- Why: the frontend profile has a breadwinnerDeath field (used by the NFBS
-- and EPS-family eligibility rules), but the original profiles table has
-- no column for it. Without this column, profile sync keeps that one
-- field on the device only (the sync code retries without it, so sync
-- still works for every other field).
--
-- What this does: adds ONE boolean column, default false. No RLS change
-- is needed — the existing profiles_owner_all policy already covers all
-- columns on the table, including this one.
--
-- No backfill: existing rows get false, which may not reflect their true
-- breadwinner status. After running this, re-save the profile in the app
-- (My Profile → Save Profile) to write the correct value.
-- This file alone does NOT change the live database — it must be run in
-- the Supabase SQL Editor, exactly like the earlier migrations.

alter table public.profiles
  add column if not exists breadwinner_death boolean default false;
