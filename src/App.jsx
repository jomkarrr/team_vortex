import React, { useState } from 'react'
import Home from './pages/Home'
import Eligibility from './pages/Eligibility'
import Status from './pages/Status'
import Troubleshooter from './pages/Troubleshooter'
import Schemes from './pages/Schemes'
import { isBackendConnected } from './services/supabaseClient'

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'eligibility', label: 'Pension Dhundo' },
  { id: 'status', label: 'Status' },
  { id: 'help', label: 'Band Kyun Hua?' },
  { id: 'schemes', label: 'Yojanayein' },
]

export default function App() {
  const [page, setPage] = useState('home')
  const go = (p) => { setPage(p); window.scrollTo({ top: 0 }) }

  return (
    <div className="app">
      <header className="header">
        <div className="brand" onClick={() => go('home')}>
          <span className="brand-name">PensionSaarthi</span>
          <span className="brand-tag">Team VORTEX · IMPACTX 2026 · Topic 20</span>
        </div>
        <span className="backend-pill" title="Backend connection status">
          {isBackendConnected ? 'Backend: Supabase connected' : 'Backend: Demo mode (offline-ready)'}
        </span>
      </header>

      <nav className="nav">
        {TABS.map((t) => (
          <button key={t.id} className={page === t.id ? 'nav-btn active' : 'nav-btn'} onClick={() => go(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main">
        {page === 'home' && <Home go={go} />}
        {page === 'eligibility' && <Eligibility />}
        {page === 'status' && <Status go={go} />}
        {page === 'help' && <Troubleshooter />}
        {page === 'schemes' && <Schemes />}
      </main>

      <footer className="footer">
        PensionSaarthi — ek prototype hai. Sarkari jaankari ke liye hamesha nsap.nic.in,
        jeevanpramaan.gov.in ya apne Gram/Ward Sachivalayam se confirm karein.
      </footer>
    </div>
  )
}
