import React, { useState } from 'react'
import { ISSUES } from '../data/troubleshooter'

export default function Troubleshooter() {
  const [openId, setOpenId] = useState(ISSUES[0].id)
  return (
    <div>
      <h2 className="page-title">Why Did My Pension Stop?</h2>
      <p className="hero-sub">Choose your problem. We explain the likely reason and the full recovery process — so you understand it at home before visiting any office.</p>
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
                <p><strong>Why it happens:</strong> {issue.why}</p>
                <div className="docs-title">Steps to fix it:</div>
                <ol className="steps-list">{issue.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                <p className="note"><strong>Documents:</strong> {issue.documents.join(' · ')}</p>
                <p className="note"><strong>Where to go:</strong> {issue.where}</p>
                <p className="warning">⚠ {issue.warning}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
