import React from 'react'
import StatusTimeline from '../components/StatusTimeline'
import { loadProfile, getOrCreateMyApplication } from '../lib/storage'
import { evaluateProfile } from '../lib/eligibility'

// Track Status — ONLY the logged-in user's own application.
// There is no list of other users here, by design: the application is built
// from the saved My Profile on this device (name, state, eligibility) and
// stored under that profile. Another user on another device sees only theirs.
// If no profile exists yet, this page asks for it first instead of showing
// anyone else's data.

export default function Status({ go }) {
  const profile = loadProfile()

  if (!profile) {
    return (
      <div>
        <h2 className="page-title">Track Pension Status</h2>
        <p className="hero-sub">Status is personal, so it needs your profile first. Set up My Profile once — then only your own application will ever appear here.</p>
        <button className="btn primary" onClick={() => go('profile')}>Set up My Profile →</button>
      </div>
    )
  }

  const results = evaluateProfile(profile)
  const firstEligible = results.find((r) => r.status === 'eligible')
  const application = getOrCreateMyApplication(profile, firstEligible ? firstEligible.scheme.name : null)

  return (
    <div>
      <h2 className="page-title">Track Pension Status</h2>
      <p className="hero-sub">
        Showing only <strong>{profile.name || 'your'}</strong> application ({profile.state}).
        No other user's application is visible on this screen.
      </p>

      <div className="card" style={{ marginBottom: 0 }}>
        <div className="scheme-name">{application.applicantName}</div>
        <div className="scheme-meta">Your application · {application.schemeName}</div>
      </div>

      <StatusTimeline application={application} />
      {application.currentStatus === 'Verified' && (
        <button className="btn primary" onClick={() => go('helpcentres')}>Where to get help →</button>
      )}
      <p className="note" style={{ marginTop: 12 }}>
        <button className="btn small ghost" style={{ marginTop: 0 }} onClick={() => go('profile')}>Edit My Profile</button>
        {' '}Changing your profile updates the applicant name here, but keeps the same application number.
      </p>
      <p className="disclaimer">In this prototype, status is generated from your own saved profile on this device. In production, this same screen connects to a Supabase / UMANG–DBT status feed for your application number only — the screen does not change, only the data source does.</p>
    </div>
  )
}
