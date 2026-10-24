import { SCHEMES } from '../data/schemes'

// Explainable eligibility in English: every result carries the exact reasons
// it passed or failed, so the app never misleads — the core promise of Topic 20.
// Statuses: 'eligible' | 'almost' (exactly 1 fixable failure) | 'not' | 'info'

function check(scheme, p) {
  const r = scheme.rules || {}
  const passed = []
  const failed = []

  if (r.special === 'breadwinnerDeath') {
    return p.breadwinnerDeath
      ? { status: 'eligible', passed: ['The primary breadwinner died at age 18–59'], failed: [] }
      : { status: 'info', passed: [], failed: [] }
  }
  if (r.special === 'notReceivingPension') {
    if (p.receivingPension) return { status: 'info', passed: [], failed: [] }
  }
  if (r.special === 'epfoFamily') {
    return p.isWidow && p.breadwinnerDeath
      ? { status: 'info', passed: ['Spouse was a pensioner — a family pension case applies; confirm with documents'], failed: [] }
      : { status: 'info', passed: [], failed: [] }
  }

  if (r.minAge != null) {
    if (p.age >= r.minAge) passed.push(`Age ${p.age} — meets the minimum of ${r.minAge}`)
    else failed.push(`Minimum age is ${r.minAge} years; current age is ${p.age}`)
  }
  if (r.maxAge != null) {
    if (p.age <= r.maxAge) passed.push(`Age ${p.age} — within the joining limit of ${r.maxAge}`)
    else failed.push(`This scheme can only be joined up to age ${r.maxAge}; current age is ${p.age}`)
  }
  if (r.requiresBPL) {
    if (p.isBPL) passed.push('BPL / rice card household')
    else failed.push('A BPL / rice card (or income certificate) is required')
  }
  if (r.requiresState) {
    if (p.state === r.requiresState) passed.push(`Resident of ${r.requiresState}`)
    else failed.push(`This scheme is only for ${r.requiresState}; selected state is ${p.state}`)
  }
  if (r.widowOnly) {
    if (p.isWidow) passed.push('Widow / widower')
    else failed.push('This scheme is only for widows / widowers')
  }
  if (r.minDisability != null) {
    if ((p.disabilityPercent || 0) >= r.minDisability) passed.push(`Disability ${p.disabilityPercent}% — meets the minimum of ${r.minDisability}%`)
    else failed.push(`Minimum disability is ${r.minDisability}%; current disability is ${p.disabilityPercent || 0}%`)
  }
  if (r.maxMonthlyIncome != null) {
    if ((p.monthlyIncome || 0) <= r.maxMonthlyIncome) passed.push(`Monthly income ₹${p.monthlyIncome || 0} — within the ₹${r.maxMonthlyIncome} limit`)
    else failed.push(`Monthly income must be ₹${r.maxMonthlyIncome} or less; current income is ₹${p.monthlyIncome}`)
  }
  if (r.requiresWorkerType) {
    if (p.workerType === r.requiresWorkerType) passed.push('Unorganised-sector worker — matches this scheme')
    else failed.push('This scheme is only for unorganised-sector workers')
  }
  if (r.excludesWorkerType && p.workerType === r.excludesWorkerType) {
    failed.push('Already covered by EPFO / a statutory pension — this scheme does not apply')
  }
  if (r.excludesTaxpayer && p.isTaxpayer) {
    failed.push('Income-tax payers cannot join this scheme (rule from 1 Oct 2022)')
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
