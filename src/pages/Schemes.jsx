import React from 'react'
import { SCHEMES } from '../data/schemes'

export default function Schemes() {
  const demoProfile = { age: 65 }
  return (
    <div>
      <h2 className="page-title">Saari Pension Yojanayein</h2>
      <p className="hero-sub">Asli niyam, asli rakam. Jahan "central share" hai wahan state apna hissa aur jodta hai — isiliye do rajyo me rakam alag hoti hai.</p>
      {SCHEMES.map((s) => (
        <div key={s.id} className="card">
          <div className="scheme-name">{s.name}</div>
          <div className="scheme-meta">{s.level} · {s.category}</div>
          <p className="note">{s.amountNote}</p>
          <p className="note"><strong>Documents:</strong> {s.documents.join(' · ')}</p>
          <p className="note"><strong>Apply:</strong> {s.applyWhere}</p>
          <p className="note dim">Source: {s.source} · Reference amount (age 65): ₹{(typeof s.amount === 'function' ? s.amount(demoProfile) : s.amount).toLocaleString('en-IN')}</p>
        </div>
      ))}
    </div>
  )
}
