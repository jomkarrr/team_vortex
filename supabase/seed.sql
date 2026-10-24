-- PensionSaarthi — seed data: the 3 demo personas + their applications.
-- Mirrors src/data/demoPersonas.js so the UI looks identical on Supabase or local mode.

insert into public.profiles (display_name, age, state, is_bpl, is_widow, disability_percent, worker_type, monthly_income, is_taxpayer, receiving_pension)
values
  ('Ramulamma', 67, 'Andhra Pradesh', true, true, 0, 'none', 0, false, false),
  ('Srinivas Rao', 82, 'Andhra Pradesh', true, false, 0, 'formal', 0, false, true),
  ('Lakshmi', 59, 'Andhra Pradesh', false, true, 0, 'none', 0, false, false)
on conflict do nothing;

insert into public.schemes (id, name, level, category, amount_note, documents, apply_where, source)
values
  ('ignoaps','IGNOAPS — Old Age Pension (NSAP)','Central','Old Age','Central share ₹200 (60–79) / ₹500 (80+); state adds top-up', ARRAY['Aadhaar card','Age proof','BPL / rice card','Bank passbook'], 'Sachivalayam / MeeSeva / UMANG', 'NSAP'),
  ('ntr-widow','NTR Bharosa — Widow Pension (AP)','State — Andhra Pradesh','Widow','₹4,000/month (full AP amount)', ARRAY['Husband death certificate','Aadhaar card','Rice card','Bank passbook'], 'Gram / Ward Sachivalayam (AP)', 'Govt of AP'),
  ('eps-family','EPS Family Pension (EPFO)','Central — Formal Sector','Family Pension','Spouse gets 50% of pension', ARRAY['Death certificate','Form 10D','UAN','Aadhaar + cancelled cheque'], 'EPFO branch + bank', 'EPFO')
on conflict (id) do update set name = excluded.name;

insert into public.applications (id, scheme_id, scheme_name, applied_on, current_status, problem)
values
  ('APP-2026-1001','ntr-widow','NTR Bharosa — Widow Pension (AP)','2026-10-05','Verified','Ek document bacha hai: husband death certificate'),
  ('PPO-AP-88412','ignoaps','IGNOAPS + State Top-up','2019-04-01','Failed','Life Certificate (Jeevan Pramaan) jama nahi hua'),
  ('APP-2026-1042','eps-family','EPS Family Pension (EPFO)','2026-10-18','Applied','Family pension = pension ka 50%')
on conflict (id) do update set current_status = excluded.current_status;

insert into public.application_status_events (application_id, status, event_date, note)
values
  ('APP-2026-1001','Applied','2026-10-05','Gram Sachivalayam pe application diya'),
  ('APP-2026-1001','Verified','2026-10-12','Documents sahi — death certificate pending'),
  ('PPO-AP-88412','Credited','2025-12-07','December ki pension aayi'),
  ('PPO-AP-88412','Failed','2026-01-07','Life Certificate jama nahi hua — pension roki gayi'),
  ('APP-2026-1042','Applied','2026-10-18','Form 10D + death certificate diya')
on conflict do nothing;
