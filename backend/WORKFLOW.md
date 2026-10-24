# Backend workflow — tonight (Member A, this branch only)

Scope: `backend/` only. Frontend (`frontend/`) is NOT edited here.

## Short workflow list

1. **User: Supabase project setup (manual, ~15 min)** — see steps below. Tell me only "done", never paste keys in chat.
2. **Member A: RLS migration** — new file `backend/supabase/migrations/2026-10-24_owner_id_rls.sql`: add `owner_id` to profiles/applications/checklists/troubleshooter_sessions/helper_links, enable RLS, owner-only policies, events table append-only (INSERT only, no UPDATE/DELETE).
3. **Two-user test** — User A logs in, sees own profile/app only. User B guessing A's application number gets nothing. If this fails, backend is NOT done.
4. **Profile + status to backend** — profiles and applications/status events read/write by owner only via `supabaseClient.js` + `statusService.js` interface (shared contract, frontend changes only with Member B's OK). localStorage stays as offline cache only.
5. **Schemes versioning (P0-3 backend side)** — migration adding `source_url`, `last_verified_on`, `version` to `schemes`, so frontend can show source + date per scheme.
6. **Pincode Edge Function deploy** — `supabase functions deploy pincode` (code already drafted in `backend/functions/pincode/`). Frontend keeps manual district dropdown until this is live.
7. **Checkpoint + freeze** — Checkpoint 23:30 (merge + Vercel Preview check). Code freeze 02:30, submission 03:45–04:00. No new feature after freeze.

## CUT tonight

Phone OTP, SMS/DLT, live UMANG/NSAP/EPFO/PFMS feed, UIDAI eKYC, DigiLocker production, Google Places paid API, `places/` and `reference-data/` Edge Functions (only after pincode works).

## Manual Supabase setup (user does this in the dashboard)

1. supabase.com → New Project → name `PensionSaarthi`, region closest to India, set a DB password and save it yourself (never in chat/repo).
2. Left menu → SQL Editor → New query → paste `backend/supabase/schema.sql` → Run. Then a second query → paste `backend/supabase/seed.sql` → Run. Order matters: schema first, seed second.
3. Left menu → Authentication → Providers → Email → ON. Keep sign-in by magic link (email link), NOT phone OTP tonight.
4. Authentication → URL Configuration → Site URL = your live Vercel URL. Redirect URLs → add the same Vercel URL, plus `http://localhost:5173` for local testing.
5. Settings → API → copy Project URL and `anon` key ONLY. Never copy/share the `service_role` key.
6. Vercel → Project Settings → Environment Variables → add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` → Redeploy. Service key never goes in Vercel, chat, repo, screenshots, or PPT.
7. Tell me "project + SQL done". Then I write the Step 2 RLS migration for you to run in SQL Editor.

## Fallback rule (already agreed)

If Auth is not working by 22:30, we stop debugging it. App falls back to current device/localStorage mode, and the PPT honestly says "Backend schema + RLS ready, demo runs in device mode". No all-night Auth debugging.
