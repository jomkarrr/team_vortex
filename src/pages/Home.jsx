import React, { useState } from 'react'
import { loadProfile } from '../lib/storage'

// Home is grouped, not one crowded grid:
//   1. Core services (the 3 things most users come for)
//   2. Your profile & planning tools
//   3. Explore & get help
// Search still searches everything at once.

const SERVICES = [
  { id: 'eligibility', icon: '01', title: 'Find My Pension', desc: 'See every pension you qualify for, with the exact reason and the documents needed.', tag: 'Most used', group: 'core' },
  { id: 'status', icon: '02', title: 'Track Pension Status', desc: 'Your own timeline from Applied to Credited — and if it is stuck, the reason and the fix.', tag: 'Your application only', group: 'core' },
  { id: 'help', icon: '03', title: 'Why Did My Pension Stop?', desc: 'Diagnose the real reasons pensions stop: Life Certificate, NPCI mapping, name mismatch, family pension.', tag: 'Troubleshooter', group: 'core' },
  { id: 'profile', icon: '00', title: 'My Profile', desc: 'Fill your details once — by hand or by voice. Every other page then uses this profile, so you never fill the same details again.', tag: 'Start here', group: 'tools' },
  { id: 'calculator', icon: '05', title: 'Pension Calculator', desc: 'Planning for the future? See what you would pay and receive under APY and PM-SYM by age.', tag: 'Plan ahead', group: 'tools' },
  { id: 'reminders', icon: '06', title: 'Life Certificate Reminders', desc: 'Never lose a pension to a missed deadline. Enter your last Life Certificate date and get your next due date.', tag: 'Never miss', group: 'tools' },
  { id: 'schemes', icon: '04', title: 'All Pension Schemes', desc: 'NSAP, NTR Bharosa, APY, PM-SYM and EPS — real amounts, real rules, central vs state shown separately.', tag: '11 schemes', group: 'explore' },
  { id: 'helpcentres', icon: '07', title: 'Help Centres & Grievance', desc: 'Where to go, what to carry, and a ready grievance letter you can copy and submit.', tag: 'On-ground help', group: 'explore' },
  { id: 'voice', icon: '08', title: 'Voice Assistant for Citizens', desc: 'Speak instead of typing, in English or Hindi. The assistant navigates and reads answers aloud.', tag: 'English + Hindi', group: 'explore' },
]

const GROUPS = [
  { id: 'core', title: 'Core Services', sub: 'The three things most people come here for.' },
  { id: 'tools', title: 'Your Profile & Planning Tools', sub: 'Set up once, then plan without re-entering details.' },
  { id: 'explore', title: 'Explore & Get Help', sub: 'Schemes, help on the ground, and voice help.' },
]

export default function Home({ go, onVoice }) {
  const [query, setQuery] = useState('')
  const profile = loadProfile()
  const q = query.trim().toLowerCase()
  const filtered = q
    ? SERVICES.filter((s) => (s.title + ' ' + s.desc).toLowerCase().includes(q))
    : SERVICES

  const search = () => {
    if (filtered.length > 0) {
      const first = filtered[0]
      if (first.id === 'voice') onVoice()
      else go(first.id)
    }
  }

  const card = (s) => (
    <button key={s.id} className={`service-card ${s.id === 'help' ? 'featured' : ''}`} onClick={() => (s.id === 'voice' ? onVoice() : go(s.id))}>
      <span className="service-icon">{s.icon}</span>
      <h3>{s.title}</h3>
      <p>{s.desc}</p>
      <span className="go">{s.tag} →</span>
    </button>
  )

  return (
    <div>
      <div className="hero">
        <div className="hero-eyebrow">Pensions & Social Benefits</div>
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

      {profile ? (
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <div className="scheme-name">Welcome back, {profile.name || 'friend'} 👋</div>
          <p className="note">Your profile ({profile.state}, age {profile.age}) is saved, so Find My Pension and Track Status already know your details. Only your own details appear on this site.</p>
          <button className="btn small" onClick={() => go('status')}>Track my status →</button>
          {' '}<button className="btn small ghost" onClick={() => go('profile')}>Edit My Profile</button>
        </div>
      ) : (
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <div className="scheme-name">Start here: set up My Profile once</div>
          <p className="note">Fill it by hand or by voice (English or Hindi). After that, every page uses it automatically — and Track Status will show only your application.</p>
          <button className="btn small" onClick={() => go('profile')}>Set up My Profile →</button>
        </div>
      )}

      <div className="stats">
        <div className="stat"><b>11</b><span>Pension schemes with real rules</span></div>
        <div className="stat"><b>3</b><span>Core services: Know, Track, Fix</span></div>
        <div className="stat"><b>2</b><span>Voice languages: English + Hindi</span></div>
        <div className="stat"><b>0</b><span>OTP, password or Aadhaar number ever asked</span></div>
      </div>

      {q ? (
        <>
          <h2 className="section-title">Search results</h2>
          <div className="service-grid">
            {filtered.map(card)}
            {filtered.length === 0 && <p className="note">No service matches "{query}". Try "pension", "status" or "calculator".</p>}
          </div>
        </>
      ) : (
        GROUPS.map((g) => (
          <div key={g.id}>
            <h2 className="section-title">{g.title}</h2>
            <p className="section-sub">{g.sub}</p>
            <div className="service-grid">
              {SERVICES.filter((s) => s.group === g.id).map(card)}
            </div>
          </div>
        ))
      )}

      <h2 className="section-title">How it works</h2>
      <div className="steps">
        <div className="step"><div className="step-num">1</div><h3>Know</h3><p>Your saved profile is checked against every scheme, with the exact reason you qualify or what is missing.</p></div>
        <div className="step"><div className="step-num">2</div><h3>Track</h3><p>Follow your own application on one timeline. If a payment fails, the reason is shown in plain language — not a code.</p></div>
        <div className="step"><div className="step-num">3</div><h3>Fix</h3><p>Choose your problem and get step-by-step recovery: documents, where to go, and what to never do (like sharing an OTP).</p></div>
      </div>

      <div className="card">
        <div className="scheme-name">Built for three people, not one</div>
        <div className="two-col" style={{ marginTop: 10 }}>
          <div><strong>Pensioners</strong><p className="note">Large text, large buttons, voice help in English or Hindi, and no jargon. If you cannot read well, the Voice Assistant reads answers aloud.</p></div>
          <div><strong>Family Helpers</strong><p className="note">A son or daughter can run everything for a parent — without ever asking for their OTP or password. That is a safety feature, not a shortcut.</p></div>
        </div>
        <p className="note"><strong>Help-centre operators</strong> can use the same checklist and status screens at the counter, with the citizen.</p>
      </div>

      <p className="disclaimer">
        Note: This is a prototype, not a government website. Eligibility shown is "likely eligible" —
        the final decision is always the government officer's. Where an amount is labelled "central share", your state adds a top-up on top of it.
        For official information, visit nsap.nic.in and jeevanpramaan.gov.in, or your Gram / Ward Sachivalayam.
      </p>
    </div>
  )
}
