import React, { useState } from 'react'

const SERVICES = [
  { id: 'eligibility', icon: '01', title: 'Find My Pension', desc: 'Answer 6 simple questions. See every pension you qualify for, with the exact reason and the documents needed.', tag: 'Most used' },
  { id: 'status', icon: '02', title: 'Track Pension Status', desc: 'One clean timeline from Applied to Credited — and if it is stuck, the reason and the fix.', tag: 'Live timeline' },
  { id: 'help', icon: '03', title: 'Why Did My Pension Stop?', desc: 'Diagnose the real reasons pensions stop: Life Certificate, NPCI mapping, name mismatch, family pension.', tag: 'Troubleshooter' },
  { id: 'schemes', icon: '04', title: 'All Pension Schemes', desc: 'NSAP, NTR Bharosa, APY, PM-SYM and EPS — real amounts, real rules, central vs state shown separately.', tag: '11 schemes' },
  { id: 'calculator', icon: '05', title: 'Pension Calculator', desc: 'Planning for the future? See what you would pay and receive under APY and PM-SYM by age.', tag: 'Plan ahead' },
  { id: 'reminders', icon: '06', title: 'Life Certificate Reminders', desc: 'Never lose a pension to a missed deadline. Enter your last Life Certificate date and get your next due date.', tag: 'Never miss' },
  { id: 'helpcentres', icon: '07', title: 'Help Centres & Grievance', desc: 'Where to go, what to carry, and a ready grievance letter you can copy and submit.', tag: 'On-ground help' },
  { id: 'voice', icon: '08', title: 'Voice Assistant for Citizens', desc: 'Speak instead of typing. The assistant navigates and reads answers aloud — built for citizens who cannot read easily.', tag: 'Voice first' },
]

export default function Home({ go, onVoice }) {
  const [query, setQuery] = useState('')
  const filtered = query.trim()
    ? SERVICES.filter((s) => (s.title + ' ' + s.desc).toLowerCase().includes(query.toLowerCase()))
    : SERVICES

  const search = () => {
    if (filtered.length > 0) {
      const first = filtered[0]
      if (first.id === 'voice') onVoice()
      else go(first.id)
    }
  }

  return (
    <div>
      <div className="hero">
        <div className="hero-eyebrow">IMPACTX 2026 · Problem 20 · Pensions & Social Benefits</div>
        <h1>Your pension, without the runaround.</h1>
        <p>
          Find the pension you actually qualify for, track where your money has reached,
          and fix it when it stops — in clear language, with reasons, not just "pending".
        </p>
        <div className="hero-search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') search() }}
            placeholder="Search a service — try “pension stopped” or “calculator”"
            aria-label="Search services"
          />
          <button onClick={search}>Search</button>
        </div>
        <div className="search-hint">Popular: Find My Pension · Track Status · Why Did My Pension Stop? · Life Certificate Reminder</div>
      </div>

      <div className="stats">
        <div className="stat"><b>11</b><span>Pension schemes with real rules</span></div>
        <div className="stat"><b>3</b><span>Core services: Know, Track, Fix</span></div>
        <div className="stat"><b>61.9 lakh</b><span>NTR Bharosa beneficiaries in Andhra Pradesh</span></div>
        <div className="stat"><b>0</b><span>OTP, password or Aadhaar number ever asked</span></div>
      </div>

      <h2 className="section-title">All Services</h2>
      <p className="section-sub">Every service we planned for this product, in one place. Start with Find My Pension, or jump straight to the problem you have today.</p>
      <div className="service-grid">
        {filtered.map((s) => (
          <button key={s.id} className={`service-card ${s.id === 'help' ? 'featured' : ''}`} onClick={() => (s.id === 'voice' ? onVoice() : go(s.id))}>
            <span className="service-icon">{s.icon}</span>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <span className="go">{s.tag} →</span>
          </button>
        ))}
        {filtered.length === 0 && <p className="note">No service matches "{query}". Try "pension", "status" or "calculator".</p>}
      </div>

      <h2 className="section-title">How it works</h2>
      <div className="steps">
        <div className="step"><div className="step-num">1</div><h3>Know</h3><p>Answer a few simple questions. The rule engine checks every scheme and shows, for each one, exactly why you qualify or what is missing.</p></div>
        <div className="step"><div className="step-num">2</div><h3>Track</h3><p>Follow your application on one timeline. If a payment fails, the reason is shown in plain language — not a code.</p></div>
        <div className="step"><div className="step-num">3</div><h3>Fix</h3><p>Choose your problem and get step-by-step recovery: documents, where to go, and what to never do (like sharing an OTP).</p></div>
      </div>

      <div className="card">
        <div className="scheme-name">Built for three people, not one</div>
        <div className="two-col" style={{ marginTop: 10 }}>
          <div><strong>Pensioners</strong><p className="note">Large text, large buttons, voice-first help, and no jargon. If you cannot read well, the Voice Assistant reads answers aloud.</p></div>
          <div><strong>Family Helpers</strong><p className="note">A son or daughter can run everything for a parent — without ever asking for their OTP or password. That is a safety feature, not a shortcut.</p></div>
        </div>
        <p className="note"><strong>CSC / Sachivalayam operators</strong> can use the same checklist and status screens at the counter, with the citizen.</p>
      </div>

      <p className="disclaimer">
        Note: This is a student prototype for IMPACTX 2026, not a government website. Eligibility shown is "likely eligible" —
        the final decision is always the government officer's. Where an amount is labelled "central share", your state adds a top-up on top of it.
        For official information, visit nsap.nic.in and jeevanpramaan.gov.in, or your Gram / Ward Sachivalayam.
      </p>
    </div>
  )
}
