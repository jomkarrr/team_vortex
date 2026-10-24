import React, { useState } from 'react'
import { HELP_CENTRES, FAQS, GRIEVANCE_ISSUES } from '../data/addons'

export default function HelpCentres() {
  const [issue, setIssue] = useState(GRIEVANCE_ISSUES[0])
  const [name, setName] = useState('')
  const [appNo, setAppNo] = useState('')
  const [copied, setCopied] = useState(false)

  const letter = `Subject: Grievance — ${issue}

Respected Sir/Madam,

I, ${name || '[Your Full Name]'}, pension applicant (Application No: ${appNo || '[Application Number]'}), wish to bring the following issue to your attention: ${issue}.

I request you to kindly check the status of my case, inform me of the exact reason for the delay / stoppage, and the documents or steps needed to resolve it. I have attached / can produce the relevant documents on request.

Thank you,
${name || '[Your Full Name]'}
Date: ${new Date().toLocaleDateString('en-IN')}

Note: Submit this at the Gram / Ward Sachivalayam, District Social Welfare Office, or on CPENGRAMS (government pensioners) / EPFiGMS (EPFO pensioners), and keep the grievance number safe.`

  const copyLetter = async () => {
    try { await navigator.clipboard.writeText(letter); setCopied(true) } catch { setCopied(false) }
  }

  return (
    <div>
      <h2 className="page-title">Help Centres, Grievance & FAQs</h2>
      <p className="hero-sub">The app can guide you, but some steps need a real counter. Here is exactly where to go, what to carry, and what to write if you need to complain.</p>

      <h3 className="section-title" style={{ fontSize: 22 }}>Where to get help</h3>
      <div className="service-grid">
        {HELP_CENTRES.map((c) => (
          <div key={c.name} className="card" style={{ margin: 0 }}>
            <div className="scheme-name" style={{ fontSize: 18 }}>{c.name}</div>
            <p className="note">{c.what}</p>
            <p className="note"><strong>Carry:</strong> {c.carry}</p>
          </div>
        ))}
      </div>

      <h3 className="section-title" style={{ fontSize: 22 }}>Grievance letter generator</h3>
      <div className="card form-card">
        <label>Your issue
          <select value={issue} onChange={(e) => setIssue(e.target.value)}>
            {GRIEVANCE_ISSUES.map((i) => <option key={i}>{i}</option>)}
          </select>
        </label>
        <label>Your full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" /></label>
        <label>Application / PPO number<input value={appNo} onChange={(e) => setAppNo(e.target.value)} placeholder="Example: APP-2026-1001" /></label>
        <textarea rows={12} readOnly value={letter} style={{ width: '100%' }} />
        <button className="btn primary" onClick={copyLetter}>{copied ? 'Copied ✓' : 'Copy letter'}</button>
        <p className="note">Submit at the counter or on CPENGRAMS / EPFiGMS, and always keep the grievance number.</p>
      </div>

      <h3 className="section-title" style={{ fontSize: 22 }}>Frequently asked questions</h3>
      {FAQS.map((f) => (
        <div key={f.q} className="card" style={{ margin: '12px 0' }}>
          <div className="scheme-name" style={{ fontSize: 18 }}>{f.q}</div>
          <p className="note">{f.a}</p>
        </div>
      ))}
    </div>
  )
}
