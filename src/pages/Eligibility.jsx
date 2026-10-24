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
        <h2 className="page-title">{form.name || 'Aap'} ke liye pension</h2>
        <p className="hero-sub">
          {eligible.length > 0
            ? `${eligible.length} pension aapke liye banti hai. Neeche har ek ki wajah aur documents diye hain.`
            : 'Abhi koi pension pakki nahi banti — neeche dekho kya bacha hai, "Bas ek cheez bachi hai" wali sabse pehle puri karo.'}
        </p>
        {results.filter((r) => r.status !== 'info' || r.passed.length > 0).map((r) => (
          <SchemeCard key={r.scheme.id} result={r} />
        ))}
        <button className="btn ghost" onClick={() => setResults(null)}>Jaankari badlo</button>
        <p className="disclaimer">Ye "likely eligible" hai — aakhri faisla sarkari adhikari ka hota hai. Hum kabhi guarantee nahi dete.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="page-title">6 aasan sawal</h2>
      <p className="hero-sub">Jiske liye pension dekh rahe hain, unki jaankari bharo. Galat ho to baad me badal sakte ho.</p>
      <div className="card form-card">
        <label>Naam<input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Jaise: Ramulamma" /></label>
        <label>Umar (saal)<input type="number" min="0" max="120" value={form.age} onChange={(e) => set('age', Number(e.target.value))} /></label>
        <label>State
          <select value={form.state} onChange={(e) => set('state', e.target.value)}>
            <option>Andhra Pradesh</option><option>Telangana</option><option>Maharashtra</option>
            <option>Karnataka</option><option>Tamil Nadu</option><option>Other</option>
          </select>
        </label>
        <label className="check"><input type="checkbox" checked={form.isBPL} onChange={(e) => set('isBPL', e.target.checked)} /> Ghar pe BPL / rice (ration) card hai</label>
        <label className="check"><input type="checkbox" checked={form.isWidow} onChange={(e) => set('isWidow', e.target.checked)} /> Vidva / vidur hain (pati / patni ka dehant ho chuka hai)</label>
        <label>Divyangta % (na ho to 0)<input type="number" min="0" max="100" value={form.disabilityPercent} onChange={(e) => set('disabilityPercent', Number(e.target.value))} /></label>
        <label>Kaam ka type
          <select value={form.workerType} onChange={(e) => set('workerType', e.target.value)}>
            <option value="none">Koi kaam nahi / purana kaam chhod diya</option>
            <option value="unorganised">Asangathit kaam (mazdoori, kheti, dukaan, thela, ghar kaam)</option>
            <option value="formal">Sarkari / company ki naukri thi (EPFO / PF wala)</option>
          </select>
        </label>
        <label>Khud ki mahine ki aamdani (₹)<input type="number" min="0" value={form.monthlyIncome} onChange={(e) => set('monthlyIncome', Number(e.target.value))} /></label>
        <label className="check"><input type="checkbox" checked={form.isTaxpayer} onChange={(e) => set('isTaxpayer', e.target.checked)} /> Income tax dete hain</label>
        <label className="check"><input type="checkbox" checked={form.receivingPension} onChange={(e) => set('receivingPension', e.target.checked)} /> Pehle se koi pension mil rahi hai</label>
        <label className="check"><input type="checkbox" checked={form.breadwinnerDeath} onChange={(e) => set('breadwinnerDeath', e.target.checked)} /> Ghar ke mukhya kamane wale ka dehant hua hai (umar 18–59 thi)</label>
        <button className="btn primary big" onClick={submit}>Meri Pension Dekho</button>
      </div>
    </div>
  )
}
