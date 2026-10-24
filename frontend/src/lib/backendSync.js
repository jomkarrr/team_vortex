import { supabase } from '../services/supabaseClient'

// Backend sync — the ONLY lib (besides statusService) that talks to Supabase
// tables. Pages never call Supabase directly: they import these functions,
// which go through supabaseClient.js. Every function fails soft (returns
// null / ok:false, never throws) so the caller can always fall back to the
// device localStorage copy — a backend outage must never break the demo.
//
// What is synced (and what is not):
//   SYNCED: profiles (+ helper_links), applications + application_status_events
//   NOT synced (local only, by design): schemes/eligibility (backend schemes
//     have no amount function, so the local schemes.js stays the source of
//     truth), document checklists, troubleshooter sessions, reminders.
//   breadwinner_death has no backend column until the 2026-10-25 migration
//     is run in the Supabase SQL Editor. Sync retries without that column,
//     so sync still works before the migration — that one field just stays
//     on the device until the migration is run and the profile is re-saved.
//   Never synced: full Aadhaar number, OTP, bank password, bank account
//     number. The profiles table has aadhaar_last4, but this code never
//     sends it — the frontend profile does not ask for it at all.
// RLS contract: every user row carries owner_id = the logged-in user's id.
// Inserts/updates without owner_id are blocked by RLS, so owner_id is set
// on every write below. Status events are append-only (no update/delete
// policy), so events are only ever inserted, never edited.

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 0))

export function isBackendAvailable(user) {
  return Boolean(supabase && user)
}

function isoDaysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
}

function formatDateISO(iso) {
  if (!iso) return ''
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

// Demo timeline, mirroring storage.js device logic exactly (same offsets and
// notes) so a backend application looks identical to the device one it
// replaces. This is prototype/demo data, not a live government feed — the
// Status page disclaimer says so.
function buildDemoTimeline(firstEligible, profile) {
  const name = profile.name || 'you'
  const state = profile.state || ''
  if (firstEligible) {
    const schemeName = firstEligible.scheme.name
    return {
      currentStatus: 'Credited',
      appliedOnISO: isoDaysAgo(28),
      problem: null,
      events: [
        { status: 'Applied', event_date: isoDaysAgo(28), note: `Application submitted for ${name} (${state}).` },
        { status: 'Verified', event_date: isoDaysAgo(20), note: 'Documents verified at the Sachivalayam.' },
        { status: 'Approved', event_date: isoDaysAgo(12), note: `Approved under ${schemeName}.` },
        { status: 'DBT Sent', event_date: isoDaysAgo(3), note: 'Payment sent through Direct Benefit Transfer to the mapped bank account.' },
        { status: 'Credited', event_date: isoDaysAgo(1), note: 'Amount credited. Check your bank account / SMS for confirmation.' },
      ],
    }
  }
  return {
    currentStatus: 'Verified',
    appliedOnISO: isoDaysAgo(10),
    problem: 'Verification is still in progress. If documents were asked for, submit them at your Gram / Ward Sachivalayam and check again in a few days.',
    events: [
      { status: 'Applied', event_date: isoDaysAgo(10), note: `Application submitted for ${name} (${state}).` },
      { status: 'Verified', event_date: isoDaysAgo(4), note: 'Documents received and under verification.' },
    ],
  }
}

function toBackendProfileRow(form, ownerId) {
  return {
    owner_id: ownerId,
    display_name: form.name || '',
    age: clamp(form.age, 0, 120),
    state: form.state || null,
    is_bpl: Boolean(form.isBPL),
    is_widow: Boolean(form.isWidow),
    disability_percent: clamp(form.disabilityPercent, 0, 100),
    worker_type: form.workerType || 'none',
    monthly_income: Math.max(0, Number(form.monthlyIncome) || 0),
    is_taxpayer: Boolean(form.isTaxpayer),
    receiving_pension: Boolean(form.receivingPension),
    breadwinner_death: Boolean(form.breadwinnerDeath),
  }
}

function fromBackendProfileRow(row) {
  return {
    name: row.display_name || '',
    age: row.age ?? '',
    state: row.state || 'Andhra Pradesh',
    isBPL: Boolean(row.is_bpl),
    isWidow: Boolean(row.is_widow),
    disabilityPercent: row.disability_percent ?? 0,
    workerType: row.worker_type || 'none',
    monthlyIncome: row.monthly_income ?? 0,
    isTaxpayer: Boolean(row.is_taxpayer),
    receivingPension: Boolean(row.receiving_pension),
    // undefined (not false) when the column does not exist yet — the caller
    // must keep the local value in that case instead of overwriting it.
    breadwinnerDeath: typeof row.breadwinner_death === 'boolean' ? row.breadwinner_death : undefined,
    helperName: '',
    helperRelation: '',
    contactPhone: '',
  }
}

async function fetchProfileRow(user) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

async function fetchHelperRow(user) {
  try {
    const { data, error } = await supabase
      .from('helper_links')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function fetchBackendProfile(user) {
  if (!isBackendAvailable(user)) return null
  const row = await fetchProfileRow(user)
  if (!row) return null
  const profile = fromBackendProfileRow(row)
  const helper = await fetchHelperRow(user)
  if (helper) {
    profile.helperName = helper.helper_name || ''
    profile.helperRelation = helper.relation || ''
    profile.contactPhone = helper.helper_phone || ''
  }
  return { profile, profileId: row.id }
}

export async function syncProfileToBackend(user, form) {
  if (!isBackendAvailable(user)) return { ok: false, profileId: null }
  try {
    const existing = await fetchProfileRow(user)
    const rowWith = toBackendProfileRow(form, user.id)
    const { breadwinner_death: _dropped, ...rowWithout } = rowWith
    const writeProfile = async (row) => {
      if (existing) {
        return supabase.from('profiles').update(row).eq('id', existing.id).select().single()
      }
      return supabase.from('profiles').insert(row).select().single()
    }
    let res = await writeProfile(rowWith)
    if (res.error && String(res.error.message || '').includes('breadwinner_death')) {
      res = await writeProfile(rowWithout)
    }
    if (res.error || !res.data) return { ok: false, profileId: null }
    const profileId = res.data.id
    // Helper link: one row per user, linked to this profile.
    const helper = await fetchHelperRow(user)
    if (form.helperName) {
      const helperRow = {
        owner_id: user.id,
        profile_id: profileId,
        helper_name: form.helperName,
        helper_phone: form.contactPhone || null,
        relation: form.helperRelation || null,
      }
      if (helper) {
        await supabase.from('helper_links').update(helperRow).eq('id', helper.id)
      } else {
        await supabase.from('helper_links').insert(helperRow)
      }
    } else if (helper) {
      // Helper cleared in the form — do not leave a stale link behind.
      try { await supabase.from('helper_links').delete().eq('id', helper.id) } catch { /* helper staleness is minor */ }
    }
    return { ok: true, profileId }
  } catch {
    return { ok: false, profileId: null }
  }
}

export async function deleteBackendProfileData(user) {
  if (!isBackendAvailable(user)) return
  try {
    const { data: apps } = await supabase.from('applications').select('id').eq('owner_id', user.id)
    for (const a of apps || []) {
      try { await supabase.from('applications').delete().eq('id', a.id) } catch { /* best-effort */ }
    }
    await supabase.from('helper_links').delete().eq('owner_id', user.id)
    await supabase.from('profiles').delete().eq('owner_id', user.id)
  } catch { /* local clear already happened; backend staleness is minor */ }
}

function toUIApplication(appRow, eventRows, profileName) {
  return {
    applicantName: profileName || '',
    id: appRow.id,
    schemeName: appRow.scheme_name,
    appliedOn: formatDateISO(appRow.applied_on),
    currentStatus: appRow.current_status,
    problem: appRow.problem || null,
    events: (eventRows || []).map((e) => ({
      status: e.status,
      date: formatDateISO(e.event_date),
      note: e.note || '',
    })),
  }
}

async function fetchBackendApplication(user) {
  try {
    const { data: appRow, error } = await supabase
      .from('applications')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !appRow) return null
    const { data: eventRows } = await supabase
      .from('application_status_events')
      .select('*')
      .eq('application_id', appRow.id)
      .order('event_date', { ascending: true })
      .order('id', { ascending: true })
    return { appRow, eventRows: eventRows || [] }
  } catch {
    return null
  }
}

export async function getBackendApplicationForDisplay(user, profile, firstEligible, deviceAppId) {
  if (!isBackendAvailable(user)) return null
  try {
    const found = await fetchBackendApplication(user)
    if (found) {
      return { source: 'backend', application: toUIApplication(found.appRow, found.eventRows, profile.name) }
    }
    // No backend application yet — create it from the same demo timeline
    // the device version uses, after making sure the profile exists there.
    const synced = await syncProfileToBackend(user, profile)
    if (!synced.ok) return null
    const timeline = buildDemoTimeline(firstEligible, profile)
    const appRow = {
      id: deviceAppId,
      owner_id: user.id,
      profile_id: synced.profileId,
      scheme_id: firstEligible ? firstEligible.scheme.id : null,
      scheme_name: firstEligible ? firstEligible.scheme.name : 'Pension application',
      applied_on: timeline.appliedOnISO,
      current_status: timeline.currentStatus,
      problem: timeline.problem,
    }
    const { error: appError } = await supabase.from('applications').insert(appRow)
    if (appError) return null
    const eventRows = timeline.events.map((e) => ({
      application_id: deviceAppId,
      status: e.status,
      event_date: e.event_date,
      note: e.note,
    }))
    const { error: evError } = await supabase.from('application_status_events').insert(eventRows)
    if (evError) {
      // Do not leave an application with no events behind — the caller
      // falls back to the device copy, which is still complete.
      try { await supabase.from('applications').delete().eq('id', deviceAppId) } catch { /* cleanup best-effort */ }
      return null
    }
    return {
      source: 'backend',
      application: toUIApplication(
        { ...appRow, applied_on: timeline.appliedOnISO },
        timeline.events,
        profile.name,
      ),
    }
  } catch {
    return null
  }
}
