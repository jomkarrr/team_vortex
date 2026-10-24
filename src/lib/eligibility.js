import { SCHEMES } from '../data/schemes'

// Explainable eligibility: every result carries the exact reasons it passed
// or failed, so the app never misleads — the core promise of Topic 20.
// Statuses: 'eligible' | 'almost' (exactly 1 fixable failure) | 'not' | 'info'

function check(scheme, p) {
  const r = scheme.rules || {}
  const passed = []
  const failed = []

  if (r.special === 'breadwinnerDeath') {
    return p.breadwinnerDeath
      ? { status: 'eligible', passed: ['Primary breadwinner ki mrityu hui hai (18–59)'], failed: [] }
      : { status: 'info', passed: [], failed: [] }
  }
  if (r.special === 'notReceivingPension') {
    if (p.receivingPension) return { status: 'info', passed: [], failed: [] }
  }
  if (r.special === 'epfoFamily') {
    return p.isWidow && p.breadwinnerDeath
      ? { status: 'info', passed: ['Spouse pensioner the — family pension ka case banta hai, documents se confirm hoga'], failed: [] }
      : { status: 'info', passed: [], failed: [] }
  }

  if (r.minAge != null) {
    if (p.age >= r.minAge) passed.push(`Umar ${p.age} hai, chahiye ${r.minAge}+`)
    else failed.push(`Umar ${r.minAge} saal chahiye, abhi ${p.age} hai`)
  }
  if (r.maxAge != null) {
    if (p.age <= r.maxAge) passed.push(`Umar ${p.age} hai, ${r.maxAge} se kam hai`)
    else failed.push(`Ye scheme ${r.maxAge} saal ki umar tak hi join hoti hai, abhi ${p.age} hai`)
  }
  if (r.requiresBPL) {
    if (p.isBPL) passed.push('BPL / rice card hai')
    else failed.push('BPL / rice card chahiye — na ho to pehle income certificate banao')
  }
  if (r.requiresState) {
    if (p.state === r.requiresState) passed.push(`${r.requiresState} ke rehne wale hain`)
    else failed.push(`Ye sirf ${r.requiresState} ke liye hai, aap ${p.state} se hain`)
  }
  if (r.widowOnly) {
    if (p.isWidow) passed.push('Vidva / vidur hain')
    else failed.push('Ye sirf vidva / vidur ke liye hai')
  }
  if (r.minDisability != null) {
    if ((p.disabilityPercent || 0) >= r.minDisability) passed.push(`Divyangta ${p.disabilityPercent}% hai, chahiye ${r.minDisability}%+`)
    else failed.push(`Divyangta kam se kam ${r.minDisability}% chahiye, abhi ${p.disabilityPercent || 0}% hai`)
  }
  if (r.maxMonthlyIncome != null) {
    if ((p.monthlyIncome || 0) <= r.maxMonthlyIncome) passed.push(`Mahine ki aamdani ₹${p.monthlyIncome || 0} hai, seema ₹${r.maxMonthlyIncome} hai`)
    else failed.push(`Aamdani ₹${r.maxMonthlyIncome}/mahine se kam chahiye, abhi ₹${p.monthlyIncome} hai`)
  }
  if (r.requiresWorkerType) {
    if (p.workerType === r.requiresWorkerType) passed.push('Kaam ka type is scheme ke hisaab se sahi hai')
    else failed.push('Ye scheme sirf asangathit (unorganised) kaam karne walo ke liye hai')
  }
  if (r.excludesWorkerType && p.workerType === r.excludesWorkerType) {
    failed.push('EPFO / sarkari pension pehle se hai to ye scheme nahi milegi')
  }
  if (r.excludesTaxpayer && p.isTaxpayer) {
    failed.push('Income tax dene wale is scheme me nahi jud sakte (1 Oct 2022 ka niyam)')
  }

  const status = failed.length === 0 ? 'eligible' : failed.length === 1 ? 'almost' : 'not'
  return { status, passed, failed }
}

export function evaluateProfile(profile) {
  return SCHEMES.map((scheme) => {
    const { status, passed, failed } = check(scheme, profile)
    return {
      scheme,
      status,
      passed,
      failed,
      amount: typeof scheme.amount === 'function' ? scheme.amount(profile) : scheme.amount,
    }
  }).sort((a, b) => {
    const rank = { eligible: 0, almost: 1, info: 2, not: 3 }
    return rank[a.status] - rank[b.status]
  })
}
