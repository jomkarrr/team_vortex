// Offline-first local storage: profiles + document checklists live on the
// device so the app (and the demo) works without internet.
// When Supabase env vars are set, services/supabaseClient.js can sync these.
// A profile is filled ONCE and reused everywhere — the user never re-enters
// the same details on the Eligibility page.

const PROFILE_KEY = 'pensionsaarthi_profile_v1'
const CHECKLIST_KEY = 'pensionsaarthi_checklists_v1'
const MY_APPLICATION_KEY = 'pensionsaarthi_my_application_v1'

export function saveProfile(profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, updatedAt: new Date().toISOString() })) } catch { /* private mode */ }
}
export function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) } catch { return null }
}
export function clearProfile() {
  // Deleting the profile also deletes that user's own application record,
  // so the next user on this device never sees the previous user's details.
  try { localStorage.removeItem(PROFILE_KEY); localStorage.removeItem(MY_APPLICATION_KEY) } catch { /* ignore */ }
}

// The logged-in user's OWN application only. It is created once, on this
// device, from the saved profile — never from a shared list of other users.
// If the profile name changes, the same application number is kept and only
// the applicant name is updated, so the timeline never flips or leaks.
export function loadMyApplication() {
  try { return JSON.parse(localStorage.getItem(MY_APPLICATION_KEY)) } catch { return null }
}
export function saveMyApplication(app) {
  try { localStorage.setItem(MY_APPLICATION_KEY, JSON.stringify(app)) } catch { /* ignore */ }
}
export function getOrCreateMyApplication(profile, firstEligibleSchemeName) {
  const daysAgo = (n) => {
    const d = new Date(); d.setDate(d.getDate() - n)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  let app = loadMyApplication()
  if (app) {
    if (app.applicantName !== profile.name) { app = { ...app, applicantName: profile.name }; saveMyApplication(app) }
    return app
  }
  const year = new Date().getFullYear()
  const appNo = `APP-${year}-${Math.floor(1000 + Math.random() * 9000)}`
  if (firstEligibleSchemeName) {
    app = {
      applicantName: profile.name, id: appNo, schemeName: firstEligibleSchemeName,
      appliedOn: daysAgo(28), currentStatus: 'Credited',
      events: [
        { status: 'Applied', date: daysAgo(28), note: `Application submitted for ${profile.name} (${profile.state}).` },
        { status: 'Verified', date: daysAgo(20), note: 'Documents verified at the Sachivalayam.' },
        { status: 'Approved', date: daysAgo(12), note: `Approved under ${firstEligibleSchemeName}.` },
        { status: 'DBT Sent', date: daysAgo(3), note: 'Payment sent through Direct Benefit Transfer to the mapped bank account.' },
        { status: 'Credited', date: daysAgo(1), note: 'Amount credited. Check your bank account / SMS for confirmation.' },
      ],
    }
  } else {
    app = {
      applicantName: profile.name, id: appNo, schemeName: 'Pension application',
      appliedOn: daysAgo(10), currentStatus: 'Verified',
      problem: 'Verification is still in progress. If documents were asked for, submit them at your Gram / Ward Sachivalayam and check again in a few days.',
      events: [
        { status: 'Applied', date: daysAgo(10), note: `Application submitted for ${profile.name} (${profile.state}).` },
        { status: 'Verified', date: daysAgo(4), note: 'Documents received and under verification.' },
        { status: 'Approved', date: 'Pending', note: 'Decision pending — no payment has been sent yet.' },
      ],
    }
  }
  saveMyApplication(app)
  return app
}
export function getChecklist(schemeId) {
  try {
    const all = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}')
    return all[schemeId] || []
  } catch { return [] }
}
export function setChecklistItem(schemeId, doc, checked) {
  try {
    const all = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}')
    const set = new Set(all[schemeId] || [])
    if (checked) set.add(doc); else set.delete(doc)
    all[schemeId] = [...set]
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}
