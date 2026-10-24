# PensionSaarthi — Pension, Bina Bhatke

**Pensions and Social Benefits**

> Help people navigate pension and social-benefit services with clearer requirements,
> status information, and support for common complications.

## Deploy (Vercel)

Deploy target is Vercel, not GitHub Pages.

1. Fix already done in this repo: `vite.config.js` sets `base: '/'` because
   Vercel serves the site from the domain root. (Do NOT set it back to
   `/team_vortex/` — that was for GitHub Pages and breaks Vercel with a
   blank page.)
2. On vercel.com, log in with GitHub, Add New > Project, import
   `jomkarrr/team_vortex`.
3. Settings: Framework Vite, Build Command `npm run build`, Output Directory
   `dist`, Install Command `npm install`. No environment variables are
   required — without Supabase vars the app runs in demo mode with
   localStorage profiles (see `.env.example` for the optional backend).
4. Click Deploy. Every later push to `main` redeploys automatically.
   The app uses in-page navigation only, so no URL rewrites are needed.

## UMANG audit theme + animations (latest)

Read-only audit of web.umang.gov.in/landing/ (v-21.2.38): no sign-in/submission/download.
Findings applied, with limits stated honestly in `src/index.css`:
- **Font:** exact UMANG font name could NOT be verified (no DevTools access in audit).
  Audit found a single clean, slightly rounded sans, geometric headings, similar in
  style to Poppins/Nunito — so **Poppins** is used as the closest match, with
  system-sans fallback. Not claimed as UMANG's exact font file.
- **Colours (≈ approximations, not exact tokens):** deep navy ≈ #1E3A8A, primary
  ≈ #1F3B8B, link/active blue ≈ #1B75BC, benefits blue ≈ #1565A8, footer pale
  blue ≈ #EAF2F9, headings ≈ #1A1A1A, body ≈ #5A5A5A, card border ≈ #E5E5E5,
  scroll-to-top teal ≈ #29B6C0. Saffron accent replaced by UMANG blue.
- **Header/nav (UMANG pattern):** no separate coloured nav bar — white sticky
  nav, dark text, blue active underline. Nav hover now has a **left-to-right
  sliding underline (0.3s)**; active item keeps it permanently. Slide direction
  on UMANG itself was unverified (appeared ≤0.3s), the requested direction is
  what is implemented.
- **Cards:** service-card hover turns the title blue (UMANG pattern) plus a
  gentle lift; **flip cards are OUR addition, not UMANG's** (audit found NO
  flip behaviour on UMANG) — Home service cards flip on hover/focus to preview
  the back, clicking always opens the page.
- **Hero carousel (UMANG pattern):** 3 slides, ~5s auto-advance, dots + chevrons.
- **Framer Motion (installed, v14):** page fade/slide transitions, hero slide
  transitions, service-card entrance stagger; `MotionConfig reducedMotion="user"`
  and CSS `prefers-reduced-motion` respect accessibility settings.
- **Other UMANG patterns:** stats band with hairline dividers, pale-blue footer,
  help band, scroll-to-top button (bottom-left, teal arrow), voice-fab hover
  pill ("Ask PensionSaarthi", like UMANG's "Ask UMANG" pill — own wording only).
  No UMANG logos, text, helpline numbers or content were copied.

## Voice assistant training (latest)

The assistant is trained on **every navigation button by name** in `src/lib/voiceIntents.js`:
Home, My Profile, Find My Pension, Track Status, Why Did My Pension Stop?, All Schemes,
Calculator, Reminders, Help & Grievance, plus More Services and Bigger Text — each with
English, Roman Hindi and Devanagari Hindi aliases. Matching is scored, longest phrase
first ("where to get help" -> Help & Grievance, not Track Status; "my pension stopped"
-> troubleshooter, not Help Centres), with a specific-keyword fallback; a bare generic
word like "pension" alone asks for clarification instead of guessing wrong. The panel
shows "Understood: <button name>" before opening, so a misheard order is visible at once.
Tested against 37 English/Hindi utterances covering every button (all pass).

## My Profile, bilingual voice, and per-user status (latest)

- **Voice Assistant is bilingual (English + Hindi):** pick a language in the voice panel and both listening and spoken answers switch to it (en-IN / hi-IN), including Hindi keywords in Roman and Devanagari. Profile voice setup is bilingual too, including Hindi number words.
- **Navigation is decluttered:** navbar shows only Home, Find My Pension, Track Status, Why Did It Stop?, My Profile — Schemes, Calculator, Reminders and Help & Grievance live under "More Services". The home page groups services into Core Services / Profile & Planning Tools / Explore & Get Help instead of one crowded grid.
- **Track Status is per-user only:** the old shared demo-persona list is removed. Status is built from the logged-in user's own saved profile on that device (one application number, created once and kept when the name is edited) and deleting the profile deletes its application too. No other user's details ever appear. Schemes remain a reference catalogue, not user data.

## My Profile (fill once, use everywhere)

On first visit the site opens at **My Profile** in the navbar. Fill it once — by hand, or by
voice-guided setup (the assistant asks one question at a time and listens for the answer) —
and the Find My Pension page reuses it automatically. It is saved only on the device
(localStorage), can be edited or deleted anytime from My Profile, and never asks for
Aadhaar, OTP or bank passwords. Skipping on first visit only skips for that visit.

## UI v2 (professional, English, UMANG-inspired)

The interface was rebuilt in English with a professional government-portal layout:
navy top strip, white header with logo, sticky blue navbar, hero with service search,
stats strip, and a full services grid. A **separate Voice Assistant for Citizens**
(floating button + header button) speaks answers aloud and accepts voice commands
or tap commands — it never asks for Aadhaar, OTP or passwords. Add-on services:
Pension Calculator (APY / PM-SYM), Life Certificate Reminders, Help Centres directory,
Grievance Letter Generator, and FAQs — all in English, all working in the prototype.

PensionSaarthi is a working prototype that does three things no single portal does today:

1. **Meri Pension Dhundo** — Answer 6 simple questions and get every pension you
   *actually* qualify for, with the exact reason for each result, the real amount
   (central share and state share shown separately), and a tickable document checklist.
   The app never misleads: results are *Eligible / Almost (one thing missing) /
   Not eligible — and why.*
2. **Meri Pension Ka Status** — One clean timeline: `Applied → Verified → Approved →
   DBT Sent → Credited`, and if it is stuck, **the reason and the fix**, not just "pending".
3. **Pension Band Kyun Hua?** — A troubleshooter for the complications that actually
   stop pensions in India: missed/rejected Jeevan Pramaan life certificate, inactive
   Aadhaar–bank seeding / NPCI mapping, name–DOB mismatch across Aadhaar/bank/PPO,
   and the pensioner-death → family-pension transition.

Designed **elderly-first**: big text, big tap targets, one clear action per card,
simple Hindi-mixed language, and a **Family Helper Mode** — a son or daughter can
run everything for a parent *without ever asking for their OTP or password*.

## Schemes covered (real rules, researched)

| Group | Schemes |
|---|---|
| Central social (NSAP) | IGNOAPS ₹200/₹500, IGNWPS ₹300/₹500, IGNDPS ₹300/₹500, NFBS ₹20,000 one-time, Annapurna 10 kg grains |
| State — Andhra Pradesh | NTR Bharosa: Old Age ₹4,000, Widow ₹4,000, Disability ₹6,000 (up to ₹15,000 severe) |
| Contributory | Atal Pension Yojana ₹1,000–₹5,000 at 60, PM-SYM ₹3,000 at 60 |
| Formal sector | EPS Family Pension (spouse 50%, children 25% till 25) |

Amounts show the **central share** unless a state scheme is shown — the single
biggest source of "mujhe kam kyun mila?" confusion, fixed in the UI itself.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build (verified)
```

No backend needed to run: the prototype works on seeded demo data + localStorage
(offline-first — pensions users often have weak connectivity).
To connect the real backend, create a free Supabase project, run
`supabase/schema.sql` then `supabase/seed.sql`, and fill `.env` from `.env.example`.

## Demo (4 minutes, 3 personas)

1. **Ramulamma, 67, widow, AP** → Eligibility: NTR Bharosa Widow ₹4,000 eligible,
   one document missing. Status: Verified, stuck on that one document.
2. **Srinivas Rao, 82** → Status: **Failed** — Life Certificate missing.
   Troubleshooter: face-authentication fix, step by step.
3. **Lakshmi, 59** → Husband (EPFO pensioner) died → EPS Family Pension 50%,
   Form 10D checklist + the "do not spend excess pension" recovery warning.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the folder map, data flow, backend
design, API contract, and how this prototype plugs into a real UMANG/DBT status feed.

## Honest limitations

- There is **no public API** for NSAP / NTR Bharosa application status, so status
  in this prototype is seeded demo data behind the exact interface a real feed would use.
- Eligibility is **"likely eligible"** — final sanction is always the government
  officer's decision. The app says this on every result screen, on purpose.
- No full Aadhaar number is ever collected or stored (last 4 digits at most).

---
A student prototype for pensions and social benefits.
