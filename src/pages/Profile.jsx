import React, { useEffect, useRef, useState } from 'react'
import { saveProfile, loadProfile, clearProfile } from '../lib/storage'

// My Profile — fill once, use everywhere.
// Two ways to fill it, as requested:
//   1. Manual form (default, always available)
//   2. Voice-guided setup: the assistant asks one question at a time, listens,
//      understands the answer, and moves to the next question. No typing needed.
// No Aadhaar number, bank password or OTP is ever asked for or stored.

const EMPTY = {
  name: '', age: '', state: 'Andhra Pradesh', isBPL: false, isWidow: false,
  disabilityPercent: 0, workerType: 'none', monthlyIncome: 0, isTaxpayer: false,
  receivingPension: false, breadwinnerDeath: false,
  helperName: '', helperRelation: '', contactPhone: '',
}

const WORD_NUMBERS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
}

function extractNumber(text) {
  const digits = text.match(/[\d,]+/)
  if (digits) return Number(digits[0].replace(/,/g, ''))
  const t = text.toLowerCase()
  // "twelve thousand" -> 12000 ; "sixty five" -> 65
  const thousand = t.match(/([a-z]+)\s+thousand/)
  if (thousand && WORD_NUMBERS[thousand[1]] != null) return WORD_NUMBERS[thousand[1]] * 1000
  let total = 0, found = false
  t.split(/[\s-]+/).forEach((w) => { if (WORD_NUMBERS[w] != null) { total += WORD_NUMBERS[w]; found = true } })
  return found ? total : null
}

function yesNo(text) {
  const t = text.toLowerCase()
  if (/\b(yes|yeah|yep|haan|han|correct|true)\b/.test(t)) return true
  if (/\b(no|nahi|nahin|nope|not|never|false)\b/.test(t)) return false
  return null
}

const STEPS = [
  { key: 'name', question: 'What is your full name?', parse: (t) => {
    const cleaned = t.replace(/^(my name is|i am|i\'m|name is)\s+/i, '').trim()
    return cleaned.length >= 2 ? cleaned : null
  } },
  { key: 'age', question: 'How old are you, in years?', parse: (t) => { const n = extractNumber(t); return n != null && n > 0 && n <= 120 ? n : null } },
  { key: 'state', question: 'Which state do you live in? Say Andhra Pradesh, Telangana, Maharashtra, Karnataka, Tamil Nadu, or Other.', parse: (t) => {
    const states = ['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Karnataka', 'Tamil Nadu']
    const found = states.find((s) => t.toLowerCase().includes(s.toLowerCase()))
    if (found) return found
    if (/\bother\b/.test(t.toLowerCase())) return 'Other'
    return null
  } },
  { key: 'isBPL', question: 'Do you have a BPL or rice card? Say yes or no.', parse: yesNo },
  { key: 'isWidow', question: 'Are you a widow or widower? Say yes or no.', parse: yesNo },
  { key: 'disabilityPercent', question: 'What is your disability percentage? Say zero if none.', parse: (t) => { const n = extractNumber(t); return n != null && n >= 0 && n <= 100 ? n : null } },
  { key: 'workerType', question: 'What type of work do you do? Say unorganised, formal, or no work.', parse: (t) => {
    const l = t.toLowerCase()
    if (/\b(unorganised|unorganized|daily wage|labour|labor|farm|vendor|domestic|shop)\b/.test(l)) return 'unorganised'
    if (/\b(formal|government|company|office|epfo|pf)\b/.test(l)) return 'formal'
    if (/\b(no work|not working|retired|none)\b/.test(l)) return 'none'
    return null
  } },
  { key: 'monthlyIncome', question: 'What is your monthly income in rupees? Say zero if none.', parse: (t) => { const n = extractNumber(t); return n != null && n >= 0 ? n : null } },
  { key: 'isTaxpayer', question: 'Do you pay income tax? Say yes or no.', parse: yesNo },
  { key: 'receivingPension', question: 'Are you already receiving a pension? Say yes or no.', parse: yesNo },
  { key: 'breadwinnerDeath', question: 'Did the main earning member of your family die at age 18 to 59? Say yes or no.', parse: yesNo },
]

function speak(text, onEnd) {
  try {
    if (!('speechSynthesis' in window)) { if (onEnd) onEnd(); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-IN'; u.rate = 0.95
    if (onEnd) u.onend = onEnd
    window.speechSynthesis.speak(u)
  } catch { if (onEnd) onEnd() }
}

export default function Profile({ isFirstTime, onSaved, onSkip }) {
  const [form, setForm] = useState(() => loadProfile() || EMPTY)
  const [mode, setMode] = useState('manual')
  const [savedMsg, setSavedMsg] = useState('')
  const [voiceStep, setVoiceStep] = useState(-1)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceStatus, setVoiceStatus] = useState('')
  const formRef = useRef(form)
  const stepRef = useRef(-1)
  const recRef = useRef(null)

  useEffect(() => { formRef.current = form }, [form])
  useEffect(() => () => { try { recRef.current && recRef.current.stop() } catch { /* ignore */ } try { window.speechSynthesis && window.speechSynthesis.cancel() } catch { /* ignore */ } }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const doSave = () => {
    const cleaned = { ...form, age: Number(form.age) || 0, disabilityPercent: Number(form.disabilityPercent) || 0, monthlyIncome: Number(form.monthlyIncome) || 0 }
    saveProfile(cleaned)
    setForm(cleaned)
    setSavedMsg('Profile saved. You will not need to fill these details again — they will be used automatically on the Find My Pension page.')
    if (onSaved) onSaved(cleaned)
  }

  const listenForStep = (stepIdx) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setVoiceStatus('Voice listening is not supported in this browser. Please use the manual form below — it works the same way.')
      setVoiceStep(-1); stepRef.current = -1
      return
    }
    const rec = new SR()
    rec.lang = 'en-IN'; rec.interimResults = false
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      setVoiceTranscript(text)
      const step = STEPS[stepIdx]
      const value = step.parse(text)
      if (value == null) {
        setVoiceStatus('Sorry, I did not understand that. Please say it again.')
        speak('Sorry, I did not understand that. Please say it again.', () => listenForStep(stepIdx))
        return
      }
      const nextForm = { ...formRef.current, [step.key]: value }
      formRef.current = nextForm
      setForm(nextForm)
      if (stepIdx + 1 >= STEPS.length) {
        setVoiceStep(-1); stepRef.current = -1
        setVoiceStatus('Voice setup complete. Please review your details below and press Save Profile.')
        speak('Voice setup complete. Please review your details and press Save Profile.')
        return
      }
      const next = stepIdx + 1
      stepRef.current = next; setVoiceStep(next)
      setVoiceStatus(`Got it: ${value}. Next question…`)
      speak(STEPS[next].question, () => listenForStep(next))
    }
    rec.onerror = () => { setVoiceStatus('Microphone error. Please check microphone permission, or use the manual form.'); setVoiceStep(-1); stepRef.current = -1 }
    recRef.current = rec
    try { rec.start() } catch { /* already started */ }
  }

  const startVoice = () => {
    setMode('voice')
    setVoiceTranscript(''); setVoiceStatus('Starting voice setup…')
    stepRef.current = 0; setVoiceStep(0)
    speak(STEPS[0].question, () => listenForStep(0))
  }

  const stopVoice = () => {
    try { recRef.current && recRef.current.stop() } catch { /* ignore */ }
    try { window.speechSynthesis && window.speechSynthesis.cancel() } catch { /* ignore */ }
    setVoiceStep(-1); stepRef.current = -1
    setVoiceStatus('Voice setup stopped. You can continue with the manual form below.')
  }

  const existing = loadProfile()

  return (
    <div>
      <h2 className="page-title">{isFirstTime ? 'Welcome — set up your profile once' : 'My Profile'}</h2>
      <p className="hero-sub">
        Fill your details once, here. After that, the Find My Pension page will use this profile automatically —
        you will never have to fill the same details again. You can edit it anytime from the navbar.
        No Aadhaar number, bank password or OTP is asked for or stored.
      </p>

      {existing && !isFirstTime && (
        <div className="card">
          <div className="scheme-name">Saved profile</div>
          <p className="note">
            {existing.name || 'Unnamed'} · Age {existing.age} · {existing.state}
            {existing.updatedAt ? ` · Last updated ${new Date(existing.updatedAt).toLocaleDateString('en-IN')}` : ''}
          </p>
          <button className="btn small ghost" onClick={() => { clearProfile(); setForm(EMPTY); setSavedMsg('Profile cleared. Fill the form again to save a new one.') }}>Delete saved profile</button>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <button className={`btn ${mode === 'manual' ? 'primary' : ''}`} onClick={() => setMode('manual')}>Fill manually</button>
          <button className={`btn ${mode === 'voice' ? 'primary' : ''}`} onClick={() => setMode('voice')}>Fill by Voice Assistant</button>
        </div>

        {mode === 'voice' && (
          <div>
            <p className="note">
              The assistant will ask one question at a time and listen for your answer.
              Works best in Chrome / Edge with microphone permission. If voice does not work,
              switch to "Fill manually" — the result is exactly the same.
            </p>
            {voiceStep >= 0 ? (
              <div className="calc-result">
                <div><strong>Question {voiceStep + 1} of {STEPS.length}:</strong> {STEPS[voiceStep].question}</div>
                <div className="note" style={{ marginTop: 8 }}>{voiceStatus || 'Listening…'}</div>
                {voiceTranscript && <div className="note">You said: "{voiceTranscript}"</div>}
                <button className="btn small" style={{ marginTop: 10 }} onClick={stopVoice}>Stop voice setup</button>
              </div>
            ) : (
              <div>
                <button className="btn primary" onClick={startVoice}>🎙 Start Voice Setup</button>
                {voiceStatus && <p className="note" style={{ marginTop: 10 }}>{voiceStatus}</p>}
                {voiceTranscript && <p className="note">Last answer: "{voiceTranscript}"</p>}
              </div>
            )}
          </div>
        )}

        <div className="form-card" style={{ marginTop: 14 }}>
          <label>Full name<input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Example: Ramulamma" /></label>
          <label>Age (years)<input type="number" min="0" max="120" value={form.age} onChange={(e) => set('age', e.target.value)} /></label>
          <label>State
            <select value={form.state} onChange={(e) => set('state', e.target.value)}>
              <option>Andhra Pradesh</option><option>Telangana</option><option>Maharashtra</option>
              <option>Karnataka</option><option>Tamil Nadu</option><option>Other</option>
            </select>
          </label>
          <label className="check"><input type="checkbox" checked={form.isBPL} onChange={(e) => set('isBPL', e.target.checked)} /> Household has a BPL / rice (ration) card</label>
          <label className="check"><input type="checkbox" checked={form.isWidow} onChange={(e) => set('isWidow', e.target.checked)} /> Widow / widower (spouse has died)</label>
          <label>Disability % (enter 0 if none)<input type="number" min="0" max="100" value={form.disabilityPercent} onChange={(e) => set('disabilityPercent', e.target.value)} /></label>
          <label>Type of work
            <select value={form.workerType} onChange={(e) => set('workerType', e.target.value)}>
              <option value="none">No work now / stopped working</option>
              <option value="unorganised">Unorganised work (daily wage, farming, shop, street vending, domestic work)</option>
              <option value="formal">Government / company job (EPFO / PF covered)</option>
            </select>
          </label>
          <label>Own monthly income (₹)<input type="number" min="0" value={form.monthlyIncome} onChange={(e) => set('monthlyIncome', e.target.value)} /></label>
          <label className="check"><input type="checkbox" checked={form.isTaxpayer} onChange={(e) => set('isTaxpayer', e.target.checked)} /> Pays income tax</label>
          <label className="check"><input type="checkbox" checked={form.receivingPension} onChange={(e) => set('receivingPension', e.target.checked)} /> Already receiving some pension</label>
          <label className="check"><input type="checkbox" checked={form.breadwinnerDeath} onChange={(e) => set('breadwinnerDeath', e.target.checked)} /> Main earning member of the family died (aged 18–59)</label>

          <div style={{ borderTop: '1px dashed var(--border)', marginTop: 16, paddingTop: 8 }}>
            <p className="note"><strong>Family Helper (optional):</strong> if someone is helping fill this profile, their details go here — never the pensioner's OTP or password.</p>
            <label>Helper name (optional)<input value={form.helperName} onChange={(e) => set('helperName', e.target.value)} placeholder="Example: Son / Daughter name" /></label>
            <label>Helper relation (optional)
              <select value={form.helperRelation} onChange={(e) => set('helperRelation', e.target.value)}>
                <option value="">Select</option><option>Son</option><option>Daughter</option><option>Spouse</option><option>Relative</option><option>Neighbour</option><option>CSC Operator</option>
              </select>
            </label>
            <label>Contact phone (optional, for reminders only)<input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} placeholder="10-digit mobile number" /></label>
          </div>

          <button className="btn primary big" onClick={doSave}>Save Profile</button>
          {savedMsg && <p className="note" style={{ color: '#137547', fontWeight: 600 }}>{savedMsg}</p>}
          {isFirstTime && onSkip && (
            <button className="btn ghost" style={{ width: '100%', marginTop: 10 }} onClick={onSkip}>Skip for now — explore the site first</button>
          )}
        </div>
      </div>
    </div>
  )
}
