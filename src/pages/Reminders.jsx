import React, { useMemo, useState } from 'react'

const KEY = 'pensionsaarthi_life_cert_v1'

export default function Reminders() {
  const [lastDate, setLastDate] = useState(() => {
    try { return localStorage.getItem(KEY) || '' } catch { return '' }
  })
  const [saved, setSaved] = useState(false)

  const info = useMemo(() => {
    if (!lastDate) return null
    const last = new Date(lastDate)
    const due = new Date(last)
    due.setFullYear(due.getFullYear() + 1)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days = Math.round((due - today) / 86400000)
    const status = days < 0 ? 'OVERDUE — submit immediately' : days <= 30 ? 'Due soon — do it this month' : 'On track'
    return { due: due.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), days, status, overdue: days < 0 }
  }, [lastDate])

  const save = () => {
    try { localStorage.setItem(KEY, lastDate) } catch { /* ignore */ }
    setSaved(true)
  }

  return (
    <div>
      <h2 className="page-title">Life Certificate Reminders</h2>
      <p className="hero-sub">A missed Life Certificate is the most common reason a pension stops. Enter the date you last submitted it — we calculate your next due date. This date is saved only on this device.</p>

      <div className="card form-card">
        <label>Date of last Life Certificate (Jeevan Pramaan) submission
          <input type="date" value={lastDate} onChange={(e) => { setLastDate(e.target.value); setSaved(false) }} />
        </label>
        <button className="btn primary big" onClick={save} disabled={!lastDate}>Calculate my next due date</button>
        {saved && info && (
          <div className="calc-result">
            <div>Next Life Certificate due: <b>{info.due}</b></div>
            <div>Status: <strong style={{ color: info.overdue ? '#b42318' : '#137547' }}>{info.status}</strong></div>
            <div className="note">
              {info.days < 0
                ? `You are ${Math.abs(info.days)} day(s) past due. Submit by face authentication on the Jeevan Pramaan app, or call the India Post doorstep service — and check the status 2–3 days later.`
                : `${info.days} day(s) remaining. Do it in November if your pension follows the usual annual cycle, and keep the Pramaan ID SMS safe.`}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="scheme-name">Other reminders worth setting</div>
        <ul className="steps-list">
          <li><strong>Bank KYC renewal</strong> — an expired KYC can freeze the pension account. Check it at your branch once a year.</li>
          <li><strong>NPCI mapping check after changing banks</strong> — always re-confirm which account is mapped, or DBT will go to the old account.</li>
          <li><strong>Age 80 transition</strong> — NSAP central share rises from ₹200/₹300 to ₹500 at 80. If it does not change automatically, raise it at the Sachivalayam.</li>
          <li><strong>Family pension after a death</strong> — inform the bank and pension office immediately; do not withdraw pension credited after the death.</li>
        </ul>
      </div>
    </div>
  )
}
