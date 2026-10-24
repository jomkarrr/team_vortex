# PensionSaarthi — Pension, Bina Bhatke

**Pensions and Social Benefits**

> Help people navigate pension and social-benefit services with clearer requirements,
> status information, and support for common complications.

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
