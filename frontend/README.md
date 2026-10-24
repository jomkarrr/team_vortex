# Frontend — PensionSaarthi (Member B owns this folder)

**Owner: Member B (Frontend). Member A (Backend) does NOT edit files in this folder without Member B's OK — except the shared-contract files listed in §3, which change only together.**

This is the whole website: React 18 + Vite 5, English UI, elderly-first design, bilingual voice. It is deployed on Vercel from this folder (see root `vercel.json` — it builds `frontend/` and serves `frontend/dist`).

## Run it

```bash
cd frontend
npm install
npm run dev      # local dev server
npm run build    # production build -> frontend/dist (must pass before every merge)
npm run preview  # preview the production build locally
```

Environment (optional — without these, the app runs in demo mode with localStorage):
```bash
# frontend/.env  (copy frontend/.env.example, never commit the real file)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
Only the **anon key** belongs here. Never put the Supabase service key, or any other secret, in this folder, in `.env`, or in any frontend file — the browser bundle is public.

## Folder map (inside `frontend/`)

```
frontend/
├── index.html              # entry, title/meta, loads /src/main.jsx
├── package.json            # React, Vite, framer-motion, @supabase/supabase-js (client only)
├── vite.config.js          # base MUST stay '/' for Vercel (see §4)
├── .env.example            # VITE_ vars only, no real values
└── src/
    ├── main.jsx            # React root
    ├── App.jsx             # shell: header, nav (5 core tabs + More Services), page switch
    ├── index.css           # design system: Poppins, UMANG-style blues, big type/buttons
    ├── pages/              # one file per screen — Member B
    │   ├── Home.jsx, Profile.jsx, Eligibility.jsx, Status.jsx, Troubleshooter.jsx
    │   ├── Schemes.jsx, Calculator.jsx, Reminders.jsx, HelpCentres.jsx
    ├── components/         # SchemeCard, StatusTimeline, VoiceAssistant — Member B
    ├── lib/                # pure logic, no network — Member B, with one exception (§3)
    │   ├── eligibility.js  # rule engine (SHARED CONTRACT — see §3)
    │   ├── statusService.js# ONLY place that calls the backend for status — uses the §3 interface
    │   ├── storage.js      # localStorage offline cache (backend is source of truth after login)
    │   └── voiceIntents.js # voice training: every nav button, EN + Roman Hindi + Devanagari
    ├── services/
    │   └── supabaseClient.js # Supabase client (anon key only, null in demo mode)
    └── data/               # researched content — SHARED CONTRACT (§3)
        ├── schemes.js      # 11 schemes, rules, amounts, documents, sources
        ├── troubleshooter.js # 5 "Why did it stop?" flows
        ├── addons.js       # calculator / reminders / help content
        └── demoPersonas.js # NOTE: only a "REMOVED" note now — per-user status replaced demo personas
```

## Rules for Member B

1. **You own pages, components, CSS, voice, and App.jsx.** Change them freely.
2. **You may CALL the backend, never CHANGE it.** Use `supabaseClient.js` and `statusService.js` only. Never edit `backend/` schema, RLS, or Edge Functions. If the backend does not give you the data you need, ask Member A for a new field/function — do not work around it by writing to a table directly from a page.
3. **Never store or ask for:** full Aadhaar number, OTP, bank password, bank account number. Profile has no Aadhaar field. This rule overrides any demo idea.
4. **Never claim live government status.** If data comes from our backend or demo mode, the UI must label it as backend/demo status on the screen itself.
5. **Elderly-first on every new screen:** large text/buttons, tap fallback for every voice feature, `prefers-reduced-motion` respected, English UI text (voice may be Hindi/English).

## §3 — Shared contracts (change ONLY together with Member A)

These files/shapes are the boundary between frontend and backend. Neither member changes them alone:

| Contract | Rule |
|---|---|
| `src/lib/eligibility.js` return shape | `{ scheme, status, passed, failed, amount }`, status ∈ `eligible \| almost \| info \| not`. A changes a rule only after telling B; B displays reasons, never edits a rule to make a demo look better. |
| `src/lib/statusService.js` interface | Per-user only: the logged-in user's own application(s), never a list of users. Backend status today, government feed tomorrow — same shape. |
| `src/data/schemes.js` | A owns rules/amounts/sources; B owns how they are displayed. A new scheme or changed amount = A edits data + B checks the card still renders. |
| `src/services/supabaseClient.js` | A owns what it connects to; B owns how pages use it. The anon key is the only key that ever appears here. |
| Profile fields | Must match `backend/supabase/schema.sql` (`profiles` table). If B adds a form field, A adds the column + RLS first, or the field does not ship. |

## §4 — Vercel (do not break this)

- `frontend/vite.config.js` base is `'/'`. An earlier GitHub Pages setup used `'/team_vortex/'` — that breaks Vercel with a blank page. Do not restore it.
- Root `vercel.json` builds this folder: install `cd frontend && npm install`, build `cd frontend && npm run build`, output `frontend/dist`. Do not move `package.json` back to the repo root.
- Every push to `main` redeploys automatically. Before merging, `npm run build` must pass locally and the Vercel Preview must open without a blank page.

## Before you merge (Member B checklist)

- [ ] `npm run build` passes in `frontend/`
- [ ] No files outside `frontend/` edited (check `git status` — only `frontend/` paths)
- [ ] No secrets, Aadhaar numbers, or OTP fields added
- [ ] New screen tested on phone size + keyboard-only + voice (if it has a voice command, add it to `voiceIntents.js` + a test utterance)
- [ ] Member A reviewed any shared-contract change (§3)
