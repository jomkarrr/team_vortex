import React, { useMemo, useState } from 'react'

// APY contribution table (official slabs, monthly contribution for a given
// entry age and target pension). Between table ages we interpolate linearly.
// PM-SYM: worker pays ₹55–₹200 by entry age, government matches it 1:1.
const APY_TABLE = {
  18: { 1000: 42, 3000: 126, 5000: 210 },
  25: { 1000: 76, 3000: 226, 5000: 376 },
  30: { 1000: 116, 3000: 347, 5000: 577 },
  35: { 1000: 181, 3000: 543, 5000: 902 },
  40: { 1000: 291, 3000: 873, 5000: 1454 },
}
function apyContribution(age, target) {
  const ages = Object.keys(APY_TABLE).map(Number).sort((a, b) => a - b)
  if (age <= ages[0]) return APY_TABLE[ages[0]][target]
  if (age >= ages[ages.length - 1]) return APY_TABLE[ages[ages.length - 1]][target]
  for (let i = 0; i < ages.length - 1; i++) {
    const a = ages[i], b = ages[i + 1]
    if (age >= a && age <= b) {
      const t = (age - a) / (b - a)
      return Math.round(APY_TABLE[a][target] + t * (APY_TABLE[b][target] - APY_TABLE[a][target]))
    }
  }
  return APY_TABLE[30][target]
}

export default function Calculator() {
  // Prefilled from the logged-in user's own saved profile when it exists —
  // never from another user's data, and editable here without changing the profile.
  const saved = (() => { try { return JSON.parse(localStorage.getItem('pensionsaarthi_profile_v1')) } catch { return null } })()
  const [age, setAge] = useState(saved?.age || 25)
  const [target, setTarget] = useState(5000)
  const [income, setIncome] = useState(saved?.monthlyIncome || 12000)

  const apy = useMemo(() => apyContribution(age, target), [age, target])
  const pmsym = useMemo(() => Math.round(55 + ((Math.min(Math.max(age, 18), 40) - 18) * 145) / 22), [age])
  const pmsymEligible = age >= 18 && age <= 40 && income <= 15000

  return (
    <div>
      <h2 className="page-title">Pension Calculator</h2>
      <p className="hero-sub">Planning for retirement? Enter your age and see, in plain numbers, what you would pay today and what you would receive at 60.</p>

      <div className="card form-card">
        <label>Your age now
          <input type="number" min="18" max="40" value={age} onChange={(e) => setAge(Number(e.target.value))} />
        </label>
        <label>Target monthly pension under APY (₹)
          <select value={target} onChange={(e) => setTarget(Number(e.target.value))}>
            <option value={1000}>₹1,000</option>
            <option value={2000}>₹2,000 (estimated)</option>
            <option value={3000}>₹3,000</option>
            <option value={4000}>₹4,000 (estimated)</option>
            <option value={5000}>₹5,000</option>
          </select>
        </label>
        <label>Your monthly income (₹) — for PM-SYM eligibility
          <input type="number" min="0" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
        </label>

        <div className="calc-result">
          <div><strong>Atal Pension Yojana (APY)</strong></div>
          <div>You pay about <b>₹{apy.toLocaleString('en-IN')}</b> / month till age 60</div>
          <div className="note">Then you receive ₹{target.toLocaleString('en-IN')} / month for life. On your death, your spouse continues the same pension, and the accumulated corpus goes to your nominee. Income-tax payers cannot join (rule from 1 Oct 2022).</div>
        </div>

        <div className="calc-result">
          <div><strong>PM Shram Yogi Maandhan (PM-SYM)</strong></div>
          {pmsymEligible ? (
            <>
              <div>You pay about <b>₹{pmsym}</b> / month, government pays the same ₹{pmsym}</div>
              <div className="note">Then you receive a fixed ₹3,000 / month after 60. Only for unorganised workers earning ₹15,000 / month or less, not covered by EPFO / ESIC / NPS.</div>
            </>
          ) : (
            <div className="note">Not eligible for PM-SYM at this age / income (needs age 18–40 and income ₹15,000 or less).</div>
          )}
        </div>

        <p className="note dim">APY figures are interpolated between the official entry-age slabs (18, 25, 30, 35, 40) and are indicative — the exact premium is confirmed by your bank at enrolment. The key lesson for the demo: joining at 18 costs roughly one-seventh of joining at 40 for the same pension.</p>
      </div>
    </div>
  )
}
