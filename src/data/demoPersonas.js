// Seeded demo data for the prototype demo (3 personas from the research).
// In production this comes from Supabase: tables profiles / applications /
// application_status_events (see supabase/schema.sql + seed.sql).
// Status values: Applied -> Verified -> Approved -> DBT Sent -> Credited | Failed

export const PERSONAS = [
  {
    id: 'ramulamma',
    name: 'Ramulamma, 67',
    story: 'Vidva (widow), Andhra Pradesh, rice card hai. Kabhi pension mili nahi.',
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
        { status: 'Applied', date: '2026-10-05', note: 'Gram Sachivalayam pe application diya, number mila' },
        { status: 'Verified', date: '2026-10-12', note: 'Documents sahi paye gaye — death certificate pending hai' },
        { status: 'Approved', date: 'Pending', note: "Husband's death certificate jama hote hi approve hoga" },
      ],
      currentStatus: 'Verified',
      problem: "Ek document bacha hai: husband's death certificate",
    },
  },
  {
    id: 'srinivas',
    name: 'Srinivas Rao, 82',
    story: 'Pension aati thi, January se band hai. Bank bolta hai "upar se nahi aayi".',
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
        { status: 'Credited', date: '2025-12-07', note: 'December ki pension khaate me aayi' },
        { status: 'Failed', date: '2026-01-07', note: 'Pension roki gayi — Life Certificate (Jeevan Pramaan) jama nahi hua' },
      ],
      currentStatus: 'Failed',
      problem: 'Life Certificate miss — Troubleshooter me iska fix hai (face authentication wala rasta)',
    },
  },
  {
    id: 'lakshmi',
    name: 'Lakshmi, 59',
    story: 'Pati EPFO pensioner the, pichhle mahine dehant ho gaya. Aage kya karna hai, pata nahi.',
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
        { status: 'Applied', date: '2026-10-18', note: 'Form 10D + death certificate EPFO branch me diya' },
        { status: 'Verified', date: 'Pending', note: 'Bank se confirmation ka intezaar hai' },
      ],
      currentStatus: 'Applied',
      problem: 'Family pension = pati ki pension ka 50%. PPO me naam hai, isliye process tez hona chahiye',
    },
  },
]
