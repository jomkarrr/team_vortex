import React from 'react'

const STEPS = ['Applied', 'Verified', 'Approved', 'DBT Sent', 'Credited']

export default function StatusTimeline({ application }) {
  const failed = application.currentStatus === 'Failed'
  return (
    <div className="card">
      <div className="scheme-name">{application.schemeName}</div>
      <div className="scheme-meta">Application No: {application.id} · Apply kiya: {application.appliedOn}</div>

      <div className={`status-banner ${failed ? 'bad' : ''}`}>
        Abhi ki sthiti: <strong>{application.currentStatus}</strong>
      </div>
      {application.problem && <p className="note"><strong>Dhyaan dein:</strong> {application.problem}</p>}

      <div className="timeline">
        {application.events.map((e, i) => (
          <div key={i} className={`t-row ${e.status === 'Failed' ? 'fail' : ''} ${e.date === 'Pending' ? 'pending' : ''}`}>
            <div className="t-dot" />
            <div>
              <div className="t-status">{e.status} <span className="t-date">· {e.date}</span></div>
              <div className="t-note">{e.note}</div>
            </div>
          </div>
        ))}
        {!failed && application.currentStatus !== 'Credited' && (
          <p className="note dim">Aage ke steps: {STEPS.slice(STEPS.indexOf(application.currentStatus) + 1).join(' → ') || '—'}</p>
        )}
      </div>
    </div>
  )
}
