import React, { useState } from 'react'
import { getChecklist, setChecklistItem } from '../lib/storage'

const LABEL = {
  eligible: { text: 'You qualify', cls: 'badge ok' },
  almost: { text: 'One thing remaining', cls: 'badge warn' },
  not: { text: 'Does not qualify yet', cls: 'badge no' },
  info: { text: 'For information', cls: 'badge info' },
}

export default function SchemeCard({ result }) {
  const { scheme, status, passed, failed, amount } = result
  const [open, setOpen] = useState(status === 'eligible')
  const [checked, setChecked] = useState(() => getChecklist(scheme.id))

  const toggleDoc = (doc) => {
    const next = checked.includes(doc) ? checked.filter((d) => d !== doc) : [...checked, doc]
    setChecked(next)
    setChecklistItem(scheme.id, doc, next.includes(doc))
  }

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="scheme-name">{scheme.name}</div>
          <div className="scheme-meta">{scheme.level} · {scheme.category}</div>
        </div>
        <span className={LABEL[status].cls}>{LABEL[status].text}</span>
      </div>

      {amount > 0 && (
        <div className="amount">₹{amount.toLocaleString('en-IN')}<span className="per"> / month{scheme.id === 'nfbs' ? ' — one-time, not monthly' : ''}</span></div>
      )}
      <p className="note">{scheme.amountNote}</p>

      {passed.length > 0 && (
        <ul className="reasons ok-list">{passed.map((r) => <li key={r}>✓ {r}</li>)}</ul>
      )}
      {failed.length > 0 && (
        <ul className="reasons no-list">{failed.map((r) => <li key={r}>✗ {r}</li>)}</ul>
      )}

      <button className="btn small ghost" onClick={() => setOpen(!open)}>
        {open ? 'Hide documents' : 'View document checklist'}
      </button>

      {open && (
        <div className="docs">
          <div className="docs-title">Documents required — tick the ones you already have:</div>
          {scheme.documents.map((doc) => (
            <label key={doc} className="doc-row">
              <input type="checkbox" checked={checked.includes(doc)} onChange={() => toggleDoc(doc)} />
              <span>{doc}</span>
            </label>
          ))}
          <p className="note"><strong>Where to apply:</strong> {scheme.applyWhere}</p>
          <p className="note dim">Source: {scheme.source}</p>
        </div>
      )}
    </div>
  )
}
