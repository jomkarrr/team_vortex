import React from 'react'
import { SCHEMES } from '../data/schemes'

export default function Schemes() {
  const demoProfile = { age: 65 }
  return (
    <div>
      <h2 className="page-title">All Pension Schemes</h2>
      <p className="hero-sub">Real rules, real amounts. Where an amount is a "central share", the state adds its own top-up — which is why amounts differ between states.</p>
      {SCHEMES.map((s) => (
        <div key={s.id} className="card">
          <div className="scheme-name">{s.name}</div>
          <div className="scheme-meta">{s.level} · {s.category}</div>
          <p className="note">{s.amountNote}</p>
          <p className="note"><strong>Documents:</strong> {s.documents.join(' · ')}</p>
          <p className="note"><strong>Where to apply:</strong> {s.applyWhere}</p>
          <p className="note dim">Source: {s.source} · Reference amount (age 65): ₹{(typeof s.amount === 'function' ? s.amount(demoProfile) : s.amount).toLocaleString('en-IN')}</p>
        </div>
      ))}
    </div>
  )
}
