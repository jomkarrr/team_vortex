// Real, researched scheme rules.
// Amounts are the OFFICIAL central share unless a scheme is a state scheme.
// Adding a new scheme = adding one object here. No code change needed.
// Rules are declarative; src/lib/eligibility.js interprets them.
//
// Rule fields (all optional):
//   minAge, maxAge          - applicant age bounds
//   requiresBPL             - needs BPL / rice card household
//   requiresState           - e.g. 'Andhra Pradesh'
//   widowOnly               - applicant must be a widow
//   minDisability           - minimum disability % (SADAREM / UDID)
//   maxMonthlyIncome        - applicant's own monthly income ceiling
//   requiresWorkerType      - 'unorganised' | 'formal'
//   excludesWorkerType      - e.g. 'formal' for PM-SYM (EPFO members excluded)
//   excludesTaxpayer        - income-tax payers cannot join (APY, 1 Oct 2022 rule)
//   special                 - 'breadwinnerDeath' | 'notReceivingPension' | 'epfoFamily'
//                             (evaluated as info/manual-check when the trigger is absent)

export const SCHEMES = [
  {
    id: 'ignoaps',
    name: 'IGNOAPS — Old Age Pension (NSAP)',
    level: 'Central',
    category: 'Old Age',
    amount: (p) => (p.age >= 80 ? 500 : 200),
    amountNote: 'Central share only. Your state adds a top-up on top of this.',
    rules: { minAge: 60, requiresBPL: true },
    documents: ['Aadhaar card', 'Age proof (Aadhaar / voter ID)', 'BPL / rice card', 'Bank passbook (Aadhaar-seeded)'],
    applyWhere: 'Gram / Ward Sachivalayam, MeeSeva centre, or nsap.nic.in via UMANG',
    source: 'NSAP, Ministry of Rural Development',
  },
  {
    id: 'ignwps',
    name: 'IGNWPS — Widow Pension (NSAP)',
    level: 'Central',
    category: 'Widow',
    amount: (p) => (p.age >= 80 ? 500 : 300),
    amountNote: 'Central share only. Your state adds a top-up on top of this.',
    rules: { minAge: 40, requiresBPL: true, widowOnly: true },
    documents: ["Husband's death certificate", 'Aadhaar card', 'BPL / rice card', 'Bank passbook (Aadhaar-seeded)'],
    applyWhere: 'Gram / Ward Sachivalayam, MeeSeva centre, or nsap.nic.in via UMANG',
    source: 'NSAP, Ministry of Rural Development',
  },
  {
    id: 'igndps',
    name: 'IGNDPS — Disability Pension (NSAP)',
    level: 'Central',
    category: 'Disability',
    amount: (p) => (p.age >= 80 ? 500 : 300),
    amountNote: 'Central share only. For severe / multiple disability (80%+).',
    rules: { minAge: 18, requiresBPL: true, minDisability: 80 },
    documents: ['Disability certificate (80%+)', 'Aadhaar card', 'BPL / rice card', 'Bank passbook (Aadhaar-seeded)'],
    applyWhere: 'Gram / Ward Sachivalayam, MeeSeva centre, or nsap.nic.in via UMANG',
    source: 'NSAP, Ministry of Rural Development',
  },
  {
    id: 'nfbs',
    name: 'NFBS — National Family Benefit',
    level: 'Central',
    category: 'Family Benefit',
    amount: () => 20000,
    amountNote: 'One-time payment (not monthly) when the primary breadwinner (18–59) dies.',
    rules: { requiresBPL: true, special: 'breadwinnerDeath' },
    documents: ["Breadwinner's death certificate", 'Aadhaar of applicant', 'BPL / rice card', 'Bank passbook'],
    applyWhere: 'Gram / Ward Sachivalayam or District Social Welfare Office',
    source: 'NSAP, Ministry of Rural Development',
  },
  {
    id: 'annapurna',
    name: 'Annapurna — Free Food Grains',
    level: 'Central',
    category: 'Old Age',
    amount: () => 0,
    amountNote: '10 kg free food grains per month for eligible senior citizens NOT receiving a pension.',
    rules: { minAge: 60, requiresBPL: true, special: 'notReceivingPension' },
    documents: ['Aadhaar card', 'BPL / rice card', 'Age proof'],
    applyWhere: 'Fair Price (ration) shop via Gram / Ward Sachivalayam',
    source: 'NSAP, Ministry of Rural Development',
  },
  {
    id: 'ntr-oldage',
    name: 'NTR Bharosa — Old Age Pension (AP)',
    level: 'State — Andhra Pradesh',
    category: 'Old Age',
    amount: () => 4000,
    amountNote: 'Full AP state amount (this already includes the state share).',
    rules: { minAge: 60, requiresBPL: true, requiresState: 'Andhra Pradesh' },
    documents: ['Aadhaar card (age verification)', 'Rice card / income certificate', 'Bank passbook (Aadhaar-seeded)'],
    applyWhere: 'Gram / Ward Sachivalayam (AP) or NTR Bharosa portal',
    source: 'Govt of Andhra Pradesh — NTR Bharosa (28 categories, ~61.9 lakh beneficiaries)',
  },
  {
    id: 'ntr-widow',
    name: 'NTR Bharosa — Widow Pension (AP)',
    level: 'State — Andhra Pradesh',
    category: 'Widow',
    amount: () => 4000,
    amountNote: 'Full AP state amount.',
    rules: { requiresBPL: true, requiresState: 'Andhra Pradesh', widowOnly: true },
    documents: ["Husband's death certificate + his Aadhaar number", 'Aadhaar card', 'Rice card / income certificate', 'Bank passbook'],
    applyWhere: 'Gram / Ward Sachivalayam (AP) or NTR Bharosa portal',
    source: 'Govt of Andhra Pradesh — NTR Bharosa',
  },
  {
    id: 'ntr-disability',
    name: 'NTR Bharosa — Disability Pension (AP)',
    level: 'State — Andhra Pradesh',
    category: 'Disability',
    amount: () => 6000,
    amountNote: 'Severe conditions go up to ₹10,000 and complete disability up to ₹15,000.',
    rules: { requiresBPL: true, requiresState: 'Andhra Pradesh', minDisability: 40 },
    documents: ['SADAREM certificate (40%+)', 'Aadhaar card', 'Rice card / income certificate', 'Bank passbook'],
    applyWhere: 'Gram / Ward Sachivalayam (AP) or NTR Bharosa portal',
    source: 'Govt of Andhra Pradesh — NTR Bharosa',
  },
  {
    id: 'apy',
    name: 'Atal Pension Yojana (APY)',
    level: 'Central — Contributory',
    category: 'Retirement Savings',
    amount: () => 5000,
    amountNote: 'You choose ₹1,000–₹5,000/month at age 60. You contribute monthly till 60; join early = pay less.',
    rules: { minAge: 18, maxAge: 40, excludesTaxpayer: true },
    documents: ['Aadhaar card', 'Savings bank account (auto-debit)', 'Mobile number linked to Aadhaar'],
    applyWhere: 'Your bank branch or net-banking (all major banks)',
    source: 'PFRDA — 7.65 crore+ subscribers (Apr 2025). Taxpayers not eligible since 1 Oct 2022.',
  },
  {
    id: 'pmsym',
    name: 'PM Shram Yogi Maandhan (PM-SYM)',
    level: 'Central — Contributory',
    category: 'Retirement Savings',
    amount: () => 3000,
    amountNote: 'Fixed ₹3,000/month after 60. You pay ₹55–₹200/month, government pays the same amount.',
    rules: { minAge: 18, maxAge: 40, maxMonthlyIncome: 15000, requiresWorkerType: 'unorganised', excludesWorkerType: 'formal' },
    documents: ['Aadhaar card', 'Savings bank account / Jan Dhan account', 'Mobile number'],
    applyWhere: 'Common Service Centre (CSC) or maandhan.in',
    source: 'Ministry of Labour & Employment — for unorganised workers earning ≤ ₹15,000/month',
  },
  {
    id: 'eps-family',
    name: 'EPS Family Pension (EPFO)',
    level: 'Central — Formal Sector',
    category: 'Family Pension',
    amount: () => 0,
    amountNote: 'Spouse receives 50% of the pension; children 25% each (max 2) till age 25. Exact amount depends on the PPO / EPS record.',
    rules: { special: 'epfoFamily' },
    documents: ["Pensioner's death certificate", 'Form 10D (pension claim)', "Deceased member's UAN", "Beneficiary's Aadhaar + cancelled cheque"],
    applyWhere: 'EPFO portal / the EPFO branch + pension-paying bank',
    source: 'EPFO — Employees Pension Scheme (EPS-95)',
  },
]
