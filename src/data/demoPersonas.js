// Seeded demo data for the prototype demo (3 personas from the research).
// In production this comes from Supabase: tables profiles / applications /
// application_status_events (see supabase/schema.sql + seed.sql).
// Status values: Applied -> Verified -> Approved -> DBT Sent -> Credited | Failed

export const PERSONAS = [
  {
    id: 'ramulamma',
    name: 'Ramulamma, 67',
    story: 'Widow, Andhra Pradesh, holds a rice card. Has never received a pension.',
    profile: {
      name: 'Ramulamma', age: 67, state: 'Andhra Pradesh', isBPL: true, isWidow: true,
      disabilityPercent: 0, workerType: 'none', monthlyIncome: 0, isTaxpayer: false,
      receivingPension: false, breadwinnerDeath: false,
    },
    application: {
      id: 'APP-2026-1001',
      schemeId: 'ntr-widow',
      schemeName: 'NTR Bharosa — Widow Pension (AP)',
      appliedOn: '2026-10-05',
      events: [
        { status: 'Applied', date: '2026-10-05', note: 'Application submitted at Gram Sachivalayam, number received' },
        { status: 'Verified', date: '2026-10-12', note: 'Documents verified — one document is still pending' },
        { status: 'Approved', date: 'Pending', note: 'Will be approved once the death certificate is submitted' },
      ],
      currentStatus: 'Verified',
      problem: 'One document remains: husband\'s death certificate',
    },
  },
  {
    id: 'srinivas',
    name: 'Srinivas Rao, 82',
    story: 'Pension was coming regularly, then stopped in January. The bank says "nothing came from above".',
    profile: {
      name: 'Srinivas Rao', age: 82, state: 'Andhra Pradesh', isBPL: true, isWidow: false,
      disabilityPercent: 0, workerType: 'formal', monthlyIncome: 0, isTaxpayer: false,
      receivingPension: true, breadwinnerDeath: false,
    },
    application: {
      id: 'PPO-AP-88412',
      schemeId: 'ignoaps',
      schemeName: 'IGNOAPS + State Top-up',
      appliedOn: '2019-04-01',
      events: [
        { status: 'Credited', date: '2025-12-07', note: 'December pension credited to the account' },
        { status: 'Failed', date: '2026-01-07', note: 'Pension stopped — Life Certificate (Jeevan Pramaan) not submitted' },
      ],
      currentStatus: 'Failed',
      problem: 'Life Certificate missed — the Troubleshooter has the fix (face authentication route)',
    },
  },
  {
    id: 'lakshmi',
    name: 'Lakshmi, 59',
    story: 'Her husband, an EPFO pensioner, died last month. She does not know what to do next.',
    profile: {
      name: 'Lakshmi', age: 59, state: 'Andhra Pradesh', isBPL: false, isWidow: true,
      disabilityPercent: 0, workerType: 'none', monthlyIncome: 0, isTaxpayer: false,
      receivingPension: false, breadwinnerDeath: true,
    },
    application: {
      id: 'APP-2026-1042',
      schemeId: 'eps-family',
      schemeName: 'EPS Family Pension (EPFO)',
      appliedOn: '2026-10-18',
      events: [
        { status: 'Applied', date: '2026-10-18', note: 'Form 10D + death certificate submitted at EPFO branch' },
        { status: 'Verified', date: 'Pending', note: 'Awaiting confirmation from the bank' },
      ],
      currentStatus: 'Applied',
      problem: 'Family pension = 50% of the husband\'s pension. His name is in the PPO, so the process should be faster',
    },
  },
]
