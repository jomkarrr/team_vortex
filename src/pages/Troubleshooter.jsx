import React, { useState } from 'react'
import { ISSUES } from '../data/troubleshooter'

export default function Troubleshooter() {
  const [openId, setOpenId] = useState(ISSUES[0].id)
  return (
    <div>
      <h2 className="page-title">Pension Band Kyun Hua?</h2>
      <p className="hero-sub">Apni dikkat chuno. Hum batayenge wajah kya hai aur theek karne ka pura tareeka — bina office ke chakkar kaate, pehle ghar pe samajh lo.</p>
      {ISSUES.map((issue) => {
        const open = openId === issue.id
        return (
          <div key={issue.id} className="card">
            <button className="issue-head" onClick={() => setOpenId(open ? null : issue.id)}>
              <span>{issue.title}</span><span>{open ? '−' : '+'}</span>
            </button>
            <p className="note">{issue.symptom}</p>
            {open && (
              <div className="docs">
                <p><strong>Wajah:</strong> {issue.why}</p>
                <div className="docs-title">Theek karne ke steps:</div>
                <ol className="steps">{issue.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                <p className="note"><strong>Kagaz:</strong> {issue.documents.join(' · ')}</p>
                <p className="note"><strong>Kahan jayein:</strong> {issue.where}</p>
                <p className="warning">⚠ {issue.warning}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
