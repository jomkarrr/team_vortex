import React, { useEffect, useState } from 'react'
import { listDemoApplications } from '../lib/statusService'
import StatusTimeline from '../components/StatusTimeline'

export default function Status({ go }) {
  const [apps, setApps] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => { listDemoApplications().then(setApps) }, [])

  const current = apps.find((a) => a.personaId === selected)

  return (
    <div>
      <h2 className="page-title">Track Pension Status</h2>
      <p className="hero-sub">Below are three demo cases (in the real app this opens with your application number). Choose one to see where the pension has reached.</p>
      <div className="persona-row">
        {apps.map((a) => (
          <button key={a.personaId} className={`persona ${selected === a.personaId ? 'active' : ''}`} onClick={() => setSelected(a.personaId)}>
            <strong>{a.personaName}</strong><span>{a.story}</span>
          </button>
        ))}
      </div>
      {current ? (
        <>
          <StatusTimeline application={current.application} />
          {current.application.currentStatus === 'Failed' && (
            <button className="btn primary" onClick={() => go('help')}>See how to fix this →</button>
          )}
        </>
      ) : (
        <p className="note">Choose a case above.</p>
      )}
      <p className="disclaimer">In this prototype, status comes from demo data. In production, this same screen connects to a Supabase / UMANG–DBT status feed — the screen does not change, only the data source does.</p>
    </div>
  )
}
