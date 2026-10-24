# PensionSaarthi — Folder Architecture & System Design

## 1. Folder map

```
team_vortex/
├── frontend/                   # Member B — website (React 18 + Vite 5)
│   ├── README.md               # Member B workflow
│   ├── index.html              # entry HTML, title/meta
│   ├── package.json            # React, Vite, framer-motion, @supabase/supabase-js (client)
│   ├── vite.config.js          # base '/' for Vercel
│   ├── .env.example            # VITE_SUPABASE_URL / ANON_KEY (optional)
│   └── src/
│       ├── main.jsx            # React root
│       ├── App.jsx             # shell: header, nav, page switch
│       ├── index.css           # elderly-first design system (big type, big targets)
│       ├── data/               # ALL researched content lives here
│       │   ├── schemes.js      # 11 schemes, declarative rules + documents + source
│       │   ├── troubleshooter.js # 5 diagnosis flows
│       │   └── demoPersonas.js # REMOVED note only — per-user status replaced demo personas
│       ├── lib/                # pure logic, no UI, no network
│       │   ├── eligibility.js  # rule engine (SHARED CONTRACT with backend)
│       │   ├── statusService.js# ONLY module that knows where status data comes from
│       │   └── storage.js      # offline-first localStorage: profile + checklists
│       ├── services/
│       │   └── supabaseClient.js # optional backend client; null when env is empty
│       ├── components/         # SchemeCard, StatusTimeline, VoiceAssistant
│       └── pages/              # Home, Profile, Eligibility, Status, Troubleshooter,
│                               # Schemes, Calculator, Reminders, HelpCentres
├── backend/                    # Member A — Supabase only, no UI
│   ├── README.md               # Member A workflow
│   ├── supabase/
│   │   ├── schema.sql          # schemes, profiles, helper_links, applications,
│   │   │                       # application_status_events, checklists, sessions
│   │   ├── seed.sql            # seed data mirroring frontend schemes
│   │   └── migrations/         # later changes, one file per change (never edit schema.sql after apply)
│   └── functions/
│       └── pincode/            # pincode -> district/state (draft, not deployed yet)
├── docs/                       # demo script + team docs
├── CODEOWNERS                  # frontend -> Member B, backend -> Member A
├── vercel.json                 # builds frontend/ -> frontend/dist
└── README.md
```

Rule of the house: **pages talk to lib, lib talks to data/services.**
A page never imports Supabase directly, and no rule ever lives inside a component.
That is what lets us change data sources mid-hackathon without touching UI.

## 2. Data flow

```
Profile form ──> lib/eligibility.js ──(rules in data/schemes.js)──> results + reasons
                                                              └──> SchemeCard + checklist (lib/storage.js)

Status page ──> lib/statusService.js ──> demo data (prototype)
                                      └─> Supabase / future UMANG-DBT feed (production)
Troubleshooter ──> data/troubleshooter.js ──> Troubleshooter page (pure content, no state)
```

## 3. Backend design (Supabase — deliberately thin)

Why Supabase and not a custom server: in 24 hours a custom Node server costs
4–5 hours of setup + deployment + cold starts at demo time. Supabase gives
Postgres + REST + auth in under an hour, and the team already knows it.

Tables (see `backend/supabase/schema.sql`):

| Table | Purpose |
|---|---|
| `schemes` | Mirror of `data/schemes.js` so rules can be updated without a redeploy |
| `profiles` | Pensioner profile (NEVER a full Aadhaar number — `aadhaar_last4` only) |
| `helper_links` | Family Helper Mode: who is helping whom, and their relation |
| `applications` | One row per application, `current_status` + `problem` |
| `application_status_events` | Append-only status log = the timeline, fully auditable |
| `checklists` | Which documents are ready, per profile + scheme |
| `troubleshooter_sessions` | Which problem a user diagnosed, resolved or not (impact metrics) |

API contract the frontend depends on (statusService):
`listApplications() -> [{ id, schemeName, currentStatus, problem }]`,
`getApplication(id) -> { ..., events: [{ status, date, note }] }`.
Any backend that honours this — Supabase today, a UMANG/DBT adapter tomorrow —
plugs in without UI changes.

## 4. Design decisions worth defending in front of judges

1. **Explainable over "AI".** Every result shows the rule it passed/failed.
   A black-box model that wrongly promises a pension is worse than no app.
2. **Eligibility runs on-device.** Instant, offline, free; weak connectivity
   is the norm for this user group, not an edge case.
3. **Centre vs state amounts, always separate.** Most "pension kam aaya"
   grievances are really this one confusion.
4. **No credentials, by design.** Family help is a first-class mode, so users
   never need to share an OTP/password — the way most elder fraud starts.
5. **"Likely eligible", never a guarantee.** Sanction is an officer's decision;
   the app says so on every screen. Trust is the product.

## 5. Scaling path (post-hackathon)

- Plug `statusService` into UMANG / state DBT status feeds behind the same contract.
- Move `schemes` fully to the DB + an admin screen for scheme officers to update
  amounts/rules when a budget changes them (rules as data, not code).
- Add Telugu/Hindi language packs — all copy is already isolated in data/pages.
- SMS/WhatsApp status alerts via the `application_status_events` log (a new event
  = a notification), and a Jeevan Pramaan due-date reminder 30 days before expiry.
- CSC / Sachivalayam operator mode: same app, bulk profiles, offline sync.
