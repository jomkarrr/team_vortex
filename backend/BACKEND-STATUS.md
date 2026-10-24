# Backend status — for PPT C (honest wording, 2026-10-24 night)

## DONE (verified tonight, in Supabase + Vercel)

- Supabase project created; schema applied (7 tables: schemes, profiles,
  helper_links, applications, application_status_events, checklists,
  troubleshooter_sessions) + seed applied.
- RLS migration applied and verified: 8 policies in pg_policies
  (schemes public-read; profiles/applications/helper_links/checklists/
  troubleshooter_sessions owner-only; status events append-only
  read + insert, no update/delete policy).
- Schemes migration applied and verified: count = 11, matching
  frontend/src/data/schemes.js. Columns added: source_url,
  last_verified_on, version. source_url / last_verified_on are NULL
  until actually re-checked — no fake dates or URLs were filled in.
- Vercel env vars set (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY,
  anon key only, never service_role) + redeploy done.
- Auth URL config done: Email provider for magic link, Phone OFF,
  Site URL + Redirect URLs set (Vercel URL + localhost:5173).
- Pincode Edge Function deployed (reported by user 2026-10-24 23:16 IST):
  backend/functions/pincode/index.ts via Supabase CLI, Postal Pincode API
  (free, no key). Returns { ok, data: { district, state, postOffices } }.

## NOT DONE / DO NOT CLAIM IN PPT

- Profile + Track Status are NOT yet wired to the backend in the UI.
  The current UI still uses device localStorage for profile/status.
  Backend tables + RLS are ready for it, but the login UI slot is
  Member B's work (Rahul, design-first via Stitch — no code tonight).
  PPT wording must be: "Backend schema + RLS ready, demo runs in
  device mode for profile/status until login UI lands."
- Pincode UI wiring is also pending: the function is live, but the
  frontend still shows the manual district dropdown until Member B
  wires the function call. Do NOT claim "pincode auto-fill live in UI"
  until that wiring + a live-URL test are done.
- Two-user UI test NOT done (needs the login UI above). RLS policies
  are verified in SQL only, not yet by two logged-in users in the app.
- NOT built tonight, do not claim: phone OTP, SMS, live UMANG/NSAP/
  EPFO/PFMS status feed, UIDAI eKYC, DigiLocker production,
  Google Places, places/ and reference-data/ Edge Functions.
- Never stored: full Aadhaar, OTP, bank password, bank account number.
  Schema allows at most aadhaar_last4, and the profile does not ask
  for it at all.

## One-line summary for the PPT honesty slide

Real tonight: Supabase backend (schema + RLS + 11 schemes) and a live
pincode function. Backend tonight: profile/status data model ready,
UI still in device mode. Pending: login UI + backend wiring + two-user
test, then live government feeds only via partner onboarding (adapter
interface only, never simulated).
