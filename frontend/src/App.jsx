import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import Home from './pages/Home'
import Eligibility from './pages/Eligibility'
import Status from './pages/Status'
import Troubleshooter from './pages/Troubleshooter'
import Schemes from './pages/Schemes'
import Calculator from './pages/Calculator'
import Reminders from './pages/Reminders'
import HelpCentres from './pages/HelpCentres'
import Profile from './pages/Profile'
import VoiceAssistant from './components/VoiceAssistant'
import { loadProfile } from './lib/storage'

// Navigation is deliberately short: 5 core items only.
// Everything else lives under "More Services" so the bar is never crowded
// and the user always knows where the 3 core actions are.
const CORE_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'eligibility', label: 'Find My Pension' },
  { id: 'status', label: 'Track Status' },
  { id: 'help', label: 'Why Did It Stop?' },
  { id: 'profile', label: 'My Profile' },
]
const MORE_TABS = [
  { id: 'schemes', label: 'All Schemes' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'helpcentres', label: 'Help & Grievance' },
]

export default function App() {
  // First visit, no saved profile yet -> the user starts at My Profile.
  // Fill it once (by hand or by voice) and every other page reuses it.
  // Skipping only lasts for this visit; a fresh visit asks again.
  const [savedProfile, setSavedProfile] = useState(() => loadProfile())
  const [page, setPage] = useState(() => (loadProfile() ? 'home' : 'profile'))
  const [skippedProfile, setSkippedProfile] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [fontScale, setFontScale] = useState(1)
  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const go = (p) => { setPage(p); window.scrollTo({ top: 0 }) }

  const isFirstTime = !savedProfile && !skippedProfile
  const cycleFont = () => setFontScale((s) => (s >= 1.2 ? 1 : s + 0.1))

  return (
    <MotionConfig reducedMotion="user">
    <div className="app" style={{ fontSize: `${16.5 * fontScale}px` }}>
      <header className="header">
        <div className="header-inner">
          <div className="brand" onClick={() => go('home')}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="logo-mark">P</span>
              <span>
                <span className="brand-name">Pension<span>Saarthi</span></span>
                <br /><span className="brand-tag">Pensions & Social Benefits</span>
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button className="font-btn" onClick={cycleFont} title="Increase text size for easier reading">A+ Text Size</button>
            <button className={`voice-btn ${voiceOpen ? 'active' : ''}`} onClick={() => setVoiceOpen(!voiceOpen)}>
              🎙 Voice Assistant
            </button>
          </div>
        </div>
      </header>

      <nav className="nav">
        <div className="nav-inner">
          {CORE_TABS.map((t) => (
            <button key={t.id} className={page === t.id ? 'nav-btn active' : 'nav-btn'} onClick={() => go(t.id)}>
              {t.label}{t.id === 'profile' && savedProfile ? ' ✓' : ''}
            </button>
          ))}
          <div className="nav-dropdown">
            <button
              className={MORE_TABS.some((t) => t.id === page) ? 'nav-btn active' : 'nav-btn'}
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((o) => !o)}
            >
              More Services {moreOpen ? '▴' : '▾'}
            </button>
            {moreOpen && (
              <div className="dropdown-menu">
                {MORE_TABS.map((t) => (
                  <button key={t.id} className="dropdown-item" onClick={() => { setMoreOpen(false); go(t.id) }}>
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {page === 'home' && <Home go={go} onVoice={() => setVoiceOpen(true)} />}
            {page === 'eligibility' && <Eligibility go={go} />}
            {page === 'status' && <Status go={go} />}
            {page === 'help' && <Troubleshooter />}
            {page === 'schemes' && <Schemes />}
            {page === 'calculator' && <Calculator />}
            {page === 'reminders' && <Reminders />}
            {page === 'helpcentres' && <HelpCentres />}
            {page === 'profile' && (
              <Profile
                isFirstTime={isFirstTime}
                onSaved={(p) => { setSavedProfile(p); if (isFirstTime) go('home') }}
                onSkip={isFirstTime ? () => { setSkippedProfile(true); go('home') } : null}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {showTop && (
        <button className="scroll-top-btn" title="Back to top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
      )}

      <VoiceAssistant go={go} open={voiceOpen} setOpen={setVoiceOpen} onMore={() => setMoreOpen(true)} onFontSize={cycleFont} />

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <h4>PensionSaarthi</h4>
            <p>Know which pension you qualify for, track where it has reached, and fix it when it stops — with reasons, not just "pending". Built for pensioners, family helpers and help-centre operators.</p>
          </div>
          <div>
            <h4>Services</h4>
            <p><button onClick={() => go('eligibility')}>Find My Pension</button><br /><button onClick={() => go('status')}>Track Status</button><br /><button onClick={() => go('help')}>Why Did It Stop?</button><br /><button onClick={() => go('calculator')}>Pension Calculator</button></p>
          </div>
          <div>
            <h4>Official sources</h4>
            <p>NSAP (nsap.nic.in) · Jeevan Pramaan (jeevanpramaan.gov.in) · UMANG · NTR Bharosa (AP) · EPFO · PFRDA (APY). This prototype is not affiliated with the government.</p>
          </div>
        </div>
        <div className="footer-bottom">PensionSaarthi · Pensions & Social Benefits · Prototype — eligibility shown is "likely eligible"; final sanction is the government officer's decision.</div>
      </footer>
    </div>
    </MotionConfig>
  )
}
