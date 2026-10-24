// Offline-first local storage: profiles + document checklists live on the
// device so the app (and the demo) works without internet.
// When Supabase env vars are set, services/supabaseClient.js can sync these.
// A profile is filled ONCE and reused everywhere — the user never re-enters
// the same details on the Eligibility page.

const PROFILE_KEY = 'pensionsaarthi_profile_v1'
const CHECKLIST_KEY = 'pensionsaarthi_checklists_v1'

export function saveProfile(profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, updatedAt: new Date().toISOString() })) } catch { /* private mode */ }
}
export function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) } catch { return null }
}
export function clearProfile() {
  try { localStorage.removeItem(PROFILE_KEY) } catch { /* ignore */ }
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
