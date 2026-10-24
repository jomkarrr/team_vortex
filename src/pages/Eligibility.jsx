import React, { useState } from 'react'
import { evaluateProfile } from '../lib/eligibility'
import { saveProfile, loadProfile } from '../lib/storage'
import SchemeCard from '../components/SchemeCard'

const EMPTY = {
  name: '', age: 65, state: 'Andhra Pradesh', isBPL: true, isWidow: false,
  disabilityPercent: 0, workerType: 'none', monthlyIncome: 0, isTaxpayer: false,
  receivingPension: false, breadwinnerDeath: false,
}

export default function Eligibility() {
  const [form, setForm] = useState(() => loadProfile() || EMPTY)
  const [results, setResults] = useState(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = () => {
    saveProfile(form)
    setResults(evaluateProfile(form))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (results) {
    const eligible = results.filter((r) => r.status === 'eligible')
    return (
      <div>
        <h2 className="page-title">Pensions for {form.name || 'you'}</h2>
        <p className="hero-sub">
          {eligible.length > 0
            ? `${eligible.length} pension(s) qualify for you. Below, each one shows its reason and its document checklist.`
            : 'No pension fully qualifies yet — look at "One thing remaining" first; that is the fastest one to complete.'}
        </p>
        {results.filter((r) => r.status !== 'info' || r.passed.length > 0).map((r) => (
          <SchemeCard key={r.scheme.id} result={r} />
        ))}
        <button className="btn ghost" onClick={() => setResults(null)}>Change details</button>
        <p className="disclaimer">This is "likely eligible" — the final decision is the government officer's. We never guarantee a pension.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="page-title">Find My Pension — 6 simple questions</h2>
      <p className="hero-sub">Enter the details of the person the pension is for. You can change them later; your answers are saved on this device only.</p>
      <div className="card form-card">
        <label>Full name<input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Example: Ramulamma" /></label>
        <label>Age (years)<input type="number" min="0" max="120" value={form.age} onChange={(e) => set('age', Number(e.target.value))} /></label>
        <label>State
          <select value={form.state} onChange={(e) => set('state', e.target.value)}>
            <option>Andhra Pradesh</option><option>Telangana</option><option>Maharashtra</option>
            <option>Karnataka</option><option>Tamil Nadu</option><option>Other</option>
          </select>
        </label>
        <label className="check"><input type="checkbox" checked={form.isBPL} onChange={(e) => set('isBPL', e.target.checked)} /> Household has a BPL / rice (ration) card</label>
        <label className="check"><input type="checkbox" checked={form.isWidow} onChange={(e) => set('isWidow', e.target.checked)} /> Widow / widower (spouse has died)</label>
        <label>Disability % (enter 0 if none)<input type="number" min="0" max="100" value={form.disabilityPercent} onChange={(e) => set('disabilityPercent', Number(e.target.value))} /></label>
        <label>Type of work
          <select value={form.workerType} onChange={(e) => set('workerType', e.target.value)}>
            <option value="none">No work now / stopped working</option>
            <option value="unorganised">Unorganised work (daily wage, farming, shop, street vending, domestic work)</option>
            <option value="formal">Government / company job (EPFO / PF covered)</option>
          </select>
        </label>
        <label>Own monthly income (₹)<input type="number" min="0" value={form.monthlyIncome} onChange={(e) => set('monthlyIncome', Number(e.target.value))} /></label>
        <label className="check"><input type="checkbox" checked={form.isTaxpayer} onChange={(e) => set('isTaxpayer', e.target.checked)} /> Pays income tax</label>
        <label className="check"><input type="checkbox" checked={form.receivingPension} onChange={(e) => set('receivingPension', e.target.checked)} /> Already receiving some pension</label>
        <label className="check"><input type="checkbox" checked={form.breadwinnerDeath} onChange={(e) => set('breadwinnerDeath', e.target.checked)} /> Main earning member of the family died (aged 18–59)</label>
        <button className="btn primary big" onClick={submit}>Show My Pensions</button>
      </div>
    </div>
  )
}
