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
      <h2 className="page-title">Meri Pension Ka Status</h2>
      <p className="hero-sub">Neeche teen demo case hain (asli app me ye aapke application number se khulega). Ek chuno aur dekho paisa kahan tak pahuncha hai.</p>
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
            <button className="btn primary" onClick={() => go('help')}>Is dikkat ka fix dekho →</button>
          )}
        </>
      ) : (
        <p className="note">Upar se ek case chuno.</p>
      )}
      <p className="disclaimer">Prototype me status demo data se aata hai. Asli version me yahi screen Supabase / UMANG-DBT status se judegi — screen nahi badlegi, sirf data ka source badlega.</p>
    </div>
  )
}
