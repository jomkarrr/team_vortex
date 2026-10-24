import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadProfile } from '../lib/storage'

// Home is grouped, not one crowded grid:
//   1. Core services (the 3 things most users come for)
//   2. Your profile & planning tools
//   3. Explore & get help
// Search still searches everything at once.
// UMANG-audit additions: hero carousel (~5s auto-advance, dots + chevrons),
// flip service cards (OUR addition — UMANG has no flip cards; clicking a
// card always opens its page, flipping is only a preview), and Framer Motion
// entrance stagger. Colours/font come from the UMANG audit in index.css.

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

const HERO_SLIDES = [
  { eyebrow: 'Pensions & Social Benefits', title: 'Your pension, without the runaround.', text: 'Find the pension you actually qualify for, track where your money has reached, and fix it when it stops — in clear language, with reasons, not just "pending".', cta: 'eligibility', ctaLabel: 'Find My Pension →' },
  { eyebrow: 'Track — Your application only', title: 'Where has your pension reached?', text: 'One clean timeline from Applied to Credited. If a payment fails, the reason is shown in plain language — and only your own application ever appears.', cta: 'status', ctaLabel: 'Track My Status →' },
  { eyebrow: 'Fix — The stopped-pension troubleshooter', title: 'Pension stopped? Find out why, and fix it.', text: 'Life Certificate, NPCI mapping, name mismatch, family pension — each problem gets step-by-step recovery, documents, and where to go.', cta: 'help', ctaLabel: 'Why Did It Stop? →' },
]

export default function Home({ go, onVoice }) {
  const [query, setQuery] = useState('')
  const [slide, setSlide] = useState(0)
  const profile = loadProfile()
  const q = query.trim().toLowerCase()
  const filtered = q
    ? SERVICES.filter((s) => (s.title + ' ' + s.desc).toLowerCase().includes(q))
    : SERVICES

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(id)
  }, [])

  const search = () => {
    if (filtered.length > 0) {
      const first = filtered[0]
      if (first.id === 'voice') onVoice()
      else go(first.id)
    }
  }

  const openService = (s) => (s.id === 'voice' ? onVoice() : go(s.id))

  const card = (s, i) => (
    <motion.div
      key={s.id}
      className="flip-card"
      role="button"
      tabIndex={0}
      onClick={() => openService(s)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openService(s) } }}
      style={{ cursor: 'pointer' }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: (i % 3) * 0.08, ease: 'easeOut' }}
    >
      <div className="flip-inner">
        <div className="flip-face">
          <span className="service-icon">{s.icon}</span>
          <h3>{s.title}</h3>
          <p>{s.desc}</p>
          <span className="go">{s.tag} →</span>
        </div>
        <div className="flip-face flip-back">
          <h3>{s.title}</h3>
          <p>{s.tag} — hover to preview, click to open.</p>
          <span className="go">Open →</span>
        </div>
      </div>
    </motion.div>
  )

  const current = HERO_SLIDES[slide]

  return (
    <div>
      <div className="hero">
        <div className="hero-carousel">
          <button className="carousel-arrow prev" aria-label="Previous slide" onClick={() => setSlide((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}>‹</button>
          <button className="carousel-arrow next" aria-label="Next slide" onClick={() => setSlide((slide + 1) % HERO_SLIDES.length)}>›</button>
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="hero-eyebrow">{current.eyebrow}</div>
              <h1>{current.title}</h1>
              <p>{current.text}</p>
              <button className="btn primary" style={{ marginTop: 8 }} onClick={() => go(current.cta)}>{current.ctaLabel}</button>
            </motion.div>
          </AnimatePresence>
          <div className="carousel-dots">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} className={`carousel-dot ${i === slide ? 'active' : ''}`} aria-label={`Go to slide ${i + 1}`} onClick={() => setSlide(i)} />
            ))}
          </div>
        </div>
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

      <div className="card help-band">
        <div className="scheme-name">Need help with a service?</div>
        <p className="note">Visit your nearest Gram / Ward Sachivalayam or MeeSeva centre with your documents, or open the Help Centres guide to see exactly what to carry and what to write.</p>
        <button className="btn primary" onClick={() => go('helpcentres')}>Find help near you →</button>
      </div>

      <p className="disclaimer">
        Note: This is a prototype, not a government website. Eligibility shown is "likely eligible" —
        the final decision is always the government officer's. Where an amount is labelled "central share", your state adds a top-up on top of it.
        For official information, visit nsap.nic.in and jeevanpramaan.gov.in, or your Gram / Ward Sachivalayam.
      </p>
    </div>
  )
}
