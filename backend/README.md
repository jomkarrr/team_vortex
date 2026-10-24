# Backend — PensionSaarthi (Member A owns this folder)

**Owner: Member A (Backend). Member B (Frontend) does NOT edit files in this folder without Member A's OK — except the shared-contract shapes listed in §3, which change only together.**

This folder is the source of truth for data, auth, and privacy. It contains **no website UI** — the UI lives in `frontend/`. The backend is Supabase only (Postgres + Auth + Storage + Edge Functions). There is no custom Node/Express server, on purpose: less to break during a demo.

## Folder map (inside `backend/`)

```
backend/
├── supabase/
│   ├── schema.sql          # base tables: schemes, profiles, helper_links,
│   │                       #   applications, application_status_events (append-only),
│   │                       #   checklists, troubleshooter_sessions
│   ├── seed.sql            # seed data for schemes (mirrors frontend/src/data/schemes.js)
│   └── migrations/         # NEW changes go here, one file per change — see §2
├── functions/
│   ├── README.md           # how Edge Functions work, which ones exist / are planned
│   └── pincode/            # pincode -> district/state/post offices (Postal Pincode API)
│       └── index.ts        # Deno Edge Function — see its header for deploy status
├── .env.example            # backend keys — template only, NEVER real values
└── README.md               # this file
```

## Setup (Member A only)

1. Create one shared Supabase project at supabase.com. You hold the project; everyone else gets the **anon key only** (via Vercel env vars), never the service key.
2. In the Supabase SQL Editor, run `backend/supabase/schema.sql`, then `backend/supabase/seed.sql`.
3. Set Vercel env vars (project settings, not in the repo):
   - `VITE_SUPABASE_URL` — public, used by the frontend client
   - `VITE_SUPABASE_ANON_KEY` — public anon key, used by the frontend client
   - The **service key stays in Supabase only** (Edge Functions / SQL Editor). It never goes in Vercel frontend env vars, in git, in chat, in screenshots, or in the PPT.
4. Without those vars, the app runs in demo mode (localStorage + seeded data) — that is intentional, so a missing backend never gives a blank page.

## §1 — Rules for Member A

1. **You own schema, RLS, Auth, Storage, and Edge Functions.** Change them freely inside this folder.
2. **You do NOT edit `frontend/` UI** (pages, components, CSS, App.jsx). If the frontend needs a new field or endpoint, you add it here and tell Member B the exact shape (§3) — you do not edit their page to fetch it yourself.
3. **Privacy is a database rule, not a UI promise:**
   - Every user table gets `owner_id uuid references auth.users(id)` + Row Level Security: owner can read/write their own rows only.
   - `application_status_events` is append-only: the app role may INSERT, never UPDATE/DELETE history.
   - Test it with two users: User B guessing User A's application number must get nothing.
4. **Never store:** full Aadhaar number, OTP, bank password, bank account number. Schema allows at most `aadhaar_last4 char(4)`, and the current profile does not ask for it at all.
5. **Never fake a live government feed.** Backend status is labelled backend status. A future UMANG/NSAP/EPFO feed plugs into `statusService` via an adapter — it does not get simulated by writing fake "government" rows.

## §2 — Migrations (how schema changes work)

- **Never edit `schema.sql` after it has been applied to the shared project** to change a live table. Applied schema is history.
- Every change after that = a new file in `backend/supabase/migrations/`, named `YYYY-MM-DD_<short-name>.sql` (e.g. `2026-10-25_add_owner_id.sql`), applied in order in the SQL Editor, and listed in `migrations/README.md`.
- A migration that adds a column must also update RLS for that table and, if the frontend shows the field, the shared contract in §3.

## §3 — Shared contracts (change ONLY together with Member B)

Same contracts as `frontend/README.md` §3 — the single source of truth is the shape, not who wrote it:

| Contract | Rule |
|---|---|
| Eligibility result | `{ scheme, status, passed, failed, amount }`, status ∈ `eligible \| almost \| info \| not`. |
| Status interface | Per-user only, via `frontend/src/lib/statusService.js`. Backend status today, government feed tomorrow, same shape. |
| Schemes data | `backend/supabase/seed.sql` must mirror `frontend/src/data/schemes.js` (id, name, level, category, amount, documents, source). If they drift, the frontend card and the backend row disagree — fix the drift before merging. |
| Profile fields | `profiles` table shape = frontend profile form fields. New form field = migration + RLS + contract update, together. |
| Edge Function responses | Every function returns `{ ok: true, data }` or `{ ok: false, error }` (plain words, no stack traces), plus a cached fallback where possible — never a blank response on external-API failure. |

## §4 — Edge Functions (planned + existing)

| Function | Purpose | External API | Status |
|---|---|---|---|
| `pincode` | Pincode → district/state, post offices | Postal Pincode API (`api.postalpincode.in`) — free, no key | Draft code in `functions/pincode/index.ts` — **not deployed yet**. Deploy only with `supabase functions deploy pincode` after the shared project exists; frontend must keep its manual dropdown fallback until then. |
| `places` (planned) | Nearby Sachivalayam / MeeSeva / CSC / bank | OpenStreetMap first (free, cached, attribution) | Not written yet. Do not start it until `pincode` is deployed and working. |
| `reference-data` (planned) | Versioned schemes + district stats | data.gov.in CKAN API (free key, dataset-by-dataset) | Not written yet. Dataset discovery first — no dataset, no function. |
| `govt-feed` (future) | Live NSAP/UMANG/EPFO status adapter | Partner onboarding only — **no open API** | Interface only. Never simulate it. See the Round 2 plan Phase 3. |

Local test (needs the Supabase CLI): `supabase functions serve pincode`. Production deploy: `supabase functions deploy pincode`. Secrets for functions live in Supabase secrets, never in this repo.

## Before you merge (Member A checklist)

- [ ] Migration file added (not a silent edit to `schema.sql`) + listed in `migrations/README.md`
- [ ] RLS updated + two-user test done (User B cannot read User A's rows)
- [ ] No files outside `backend/` edited (check `git status` — only `backend/` paths, plus shared-contract files only with Member B's OK)
- [ ] No service key, password, or real secret in any committed file (`git diff` checked)
- [ ] Seed + schema still mirror the frontend schemes data (no drift)
- [ ] Member B reviewed any shared-contract change (§3)
