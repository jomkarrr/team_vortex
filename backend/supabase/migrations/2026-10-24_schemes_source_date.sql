-- PensionSaarthi — Migration: schemes source + last-verified date + sync to 11
-- Run this in the Supabase SQL Editor AFTER schema.sql, seed.sql and the
-- 2026-10-24_owner_id_rls.sql migration.
--
-- What it does:
--  1. Adds source_url, last_verified_on and version to public.schemes.
--  2. Syncs all 11 schemes from frontend/src/data/schemes.js into the
--     backend, so backend and frontend cards can never disagree (drift fix).
--     Existing seed rows (ignoaps, ntr-widow, eps-family) are updated to
--     match the frontend values exactly.
--
-- What it deliberately does NOT do:
--  * No fake source_url and no fake last_verified_on. Those columns stay
--    NULL until a scheme is actually re-checked against its official source
--    and the date/URL are filled in from that check. The frontend must show
--    the source text (already present) and "verify before applying" while
--    last_verified_on is NULL — never a plausible-looking invented date.
--  * No RLS change: schemes already has the public-read policy from the
--    RLS migration, and these columns inherit it.

alter table public.schemes
  add column if not exists source_url text,
  add column if not exists last_verified_on date,
  add column if not exists version int not null default 1;

insert into public.schemes (id, name, level, category, amount_note, rules, documents, apply_where, source, version) values
  ('ignoaps', 'IGNOAPS — Old Age Pension (NSAP)', 'Central', 'Old Age',
   'Central share only. Your state adds a top-up on top of this.',
   '{"minAge": 60, "requiresBPL": true}'::jsonb,
   ARRAY['Aadhaar card', 'Age proof (Aadhaar / voter ID)', 'BPL / rice card', 'Bank passbook (Aadhaar-seeded)'],
   'Gram / Ward Sachivalayam, MeeSeva centre, or nsap.nic.in via UMANG',
   'NSAP, Ministry of Rural Development', 1),
  ('ignwps', 'IGNWPS — Widow Pension (NSAP)', 'Central', 'Widow',
   'Central share only. Your state adds a top-up on top of this.',
   '{"minAge": 40, "requiresBPL": true, "widowOnly": true}'::jsonb,
   ARRAY['Husband''s death certificate', 'Aadhaar card', 'BPL / rice card', 'Bank passbook (Aadhaar-seeded)'],
   'Gram / Ward Sachivalayam, MeeSeva centre, or nsap.nic.in via UMANG',
   'NSAP, Ministry of Rural Development', 1),
  ('igndps', 'IGNDPS — Disability Pension (NSAP)', 'Central', 'Disability',
   'Central share only. For severe / multiple disability (80%+).',
   '{"minAge": 18, "requiresBPL": true, "minDisability": 80}'::jsonb,
   ARRAY['Disability certificate (80%+)', 'Aadhaar card', 'BPL / rice card', 'Bank passbook (Aadhaar-seeded)'],
   'Gram / Ward Sachivalayam, MeeSeva centre, or nsap.nic.in via UMANG',
   'NSAP, Ministry of Rural Development', 1),
  ('nfbs', 'NFBS — National Family Benefit', 'Central', 'Family Benefit',
   'One-time payment (not monthly) when the primary breadwinner (18–59) dies.',
   '{"requiresBPL": true, "special": "breadwinnerDeath"}'::jsonb,
   ARRAY['Breadwinner''s death certificate', 'Aadhaar of applicant', 'BPL / rice card', 'Bank passbook'],
   'Gram / Ward Sachivalayam or District Social Welfare Office',
   'NSAP, Ministry of Rural Development', 1),
  ('annapurna', 'Annapurna — Free Food Grains', 'Central', 'Old Age',
   '10 kg free food grains per month for eligible senior citizens NOT receiving a pension.',
   '{"minAge": 60, "requiresBPL": true, "special": "notReceivingPension"}'::jsonb,
   ARRAY['Aadhaar card', 'BPL / rice card', 'Age proof'],
   'Fair Price (ration) shop via Gram / Ward Sachivalayam',
   'NSAP, Ministry of Rural Development', 1),
  ('ntr-oldage', 'NTR Bharosa — Old Age Pension (AP)', 'State — Andhra Pradesh', 'Old Age',
   'Full AP state amount (this already includes the state share).',
   '{"minAge": 60, "requiresBPL": true, "requiresState": "Andhra Pradesh"}'::jsonb,
   ARRAY['Aadhaar card (age verification)', 'Rice card / income certificate', 'Bank passbook (Aadhaar-seeded)'],
   'Gram / Ward Sachivalayam (AP) or NTR Bharosa portal',
   'Govt of Andhra Pradesh — NTR Bharosa (28 categories, ~61.9 lakh beneficiaries)', 1),
  ('ntr-widow', 'NTR Bharosa — Widow Pension (AP)', 'State — Andhra Pradesh', 'Widow',
   'Full AP state amount.',
   '{"requiresBPL": true, "requiresState": "Andhra Pradesh", "widowOnly": true}'::jsonb,
   ARRAY['Husband''s death certificate + his Aadhaar number', 'Aadhaar card', 'Rice card / income certificate', 'Bank passbook'],
   'Gram / Ward Sachivalayam (AP) or NTR Bharosa portal',
   'Govt of Andhra Pradesh — NTR Bharosa', 1),
  ('ntr-disability', 'NTR Bharosa — Disability Pension (AP)', 'State — Andhra Pradesh', 'Disability',
   'Severe conditions go up to ₹10,000 and complete disability up to ₹15,000.',
   '{"requiresBPL": true, "requiresState": "Andhra Pradesh", "minDisability": 40}'::jsonb,
   ARRAY['SADAREM certificate (40%+)', 'Aadhaar card', 'Rice card / income certificate', 'Bank passbook'],
   'Gram / Ward Sachivalayam (AP) or NTR Bharosa portal',
   'Govt of Andhra Pradesh — NTR Bharosa', 1),
  ('apy', 'Atal Pension Yojana (APY)', 'Central — Contributory', 'Retirement Savings',
   'You choose ₹1,000–₹5,000/month at age 60. You contribute monthly till 60; join early = pay less.',
   '{"minAge": 18, "maxAge": 40, "excludesTaxpayer": true}'::jsonb,
   ARRAY['Aadhaar card', 'Savings bank account (auto-debit)', 'Mobile number linked to Aadhaar'],
   'Your bank branch or net-banking (all major banks)',
   'PFRDA — 7.65 crore+ subscribers (Apr 2025). Taxpayers not eligible since 1 Oct 2022.', 1),
  ('pmsym', 'PM Shram Yogi Maandhan (PM-SYM)', 'Central — Contributory', 'Retirement Savings',
   'Fixed ₹3,000/month after 60. You pay ₹55–₹200/month, government pays the same amount.',
   '{"minAge": 18, "maxAge": 40, "maxMonthlyIncome": 15000, "requiresWorkerType": "unorganised", "excludesWorkerType": "formal"}'::jsonb,
   ARRAY['Aadhaar card', 'Savings bank account / Jan Dhan account', 'Mobile number'],
   'Common Service Centre (CSC) or maandhan.in',
   'Ministry of Labour & Employment — for unorganised workers earning ≤ ₹15,000/month', 1),
  ('eps-family', 'EPS Family Pension (EPFO)', 'Central — Formal Sector', 'Family Pension',
   'Spouse receives 50% of the pension; children 25% each (max 2) till age 25. Exact amount depends on the PPO / EPS record.',
   '{"special": "epfoFamily"}'::jsonb,
   ARRAY['Pensioner''s death certificate', 'Form 10D (pension claim)', 'Deceased member''s UAN', 'Beneficiary''s Aadhaar + cancelled cheque'],
   'EPFO portal / the EPFO branch + pension-paying bank',
   'EPFO — Employees Pension Scheme (EPS-95)', 1)
on conflict (id) do update set
  name = excluded.name,
  level = excluded.level,
  category = excluded.category,
  amount_note = excluded.amount_note,
  rules = excluded.rules,
  documents = excluded.documents,
  apply_where = excluded.apply_where,
  source = excluded.source,
  version = excluded.version,
  updated_at = now();
