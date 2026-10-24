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
  // Hindi number words (Roman + Devanagari handled by digit conversion below)
  ek: 1, do: 2, teen: 3, chaar: 4, paanch: 5, chhe: 6, saat: 7, aath: 8, nau: 9, das: 10,
  gyarah: 11, barah: 12, terah: 13, chaudah: 14, pandrah: 15, solah: 16, satrah: 17, atharah: 18, unnis: 19,
  bees: 20, tees: 30, chalis: 40, pachas: 50, saath: 60, sattar: 70, assi: 80, nabbe: 90,
}

function toLatinDigits(text) {
  const map = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' }
  return text.replace(/[०-९]/g, (d) => map[d])
}

function extractNumber(text) {
  const digits = toLatinDigits(text).match(/[\d,]+/)
  if (digits) return Number(digits[0].replace(/,/g, ''))
  const t = toLatinDigits(text).toLowerCase()
  // "twelve thousand" -> 12000 ; "sixty five" -> 65
  const thousand = t.match(/([a-z]+)\s+thousand/)
  if (thousand && WORD_NUMBERS[thousand[1]] != null) return WORD_NUMBERS[thousand[1]] * 1000
  let total = 0, found = false
  t.split(/[\s-]+/).forEach((w) => { if (WORD_NUMBERS[w] != null) { total += WORD_NUMBERS[w]; found = true } })
  return found ? total : null
}

function yesNo(text) {
  const t = text.toLowerCase()
  if (/\b(yes|yeah|yep|haan|han|ji|bilkul|correct|true)\b/.test(t) || /हाँ|हां/.test(text)) return true
  if (/\b(no|nahi|nahin|nope|not|never|false|na)\b/.test(t) || /नहीं|नही/.test(text)) return false
  return null
}

const STEPS = [
  { key: 'name', questionEn: 'What is your full name?', questionHi: 'आपका पूरा नाम क्या है?', parse: (t) => {
    const cleaned = t.replace(/^(my name is|i am|i\'m|name is)\s+/i, '').trim()
    return cleaned.length >= 2 ? cleaned : null
  } },
  { key: 'age', questionEn: 'How old are you, in years?', questionHi: 'आपकी उम्र कितनी है, सालों में?', parse: (t) => { const n = extractNumber(t); return n != null && n > 0 && n <= 120 ? n : null } },
  { key: 'state', questionEn: 'Which state do you live in? Say Andhra Pradesh, Telangana, Maharashtra, Karnataka, Tamil Nadu, or Other.', questionHi: 'आप किस राज्य में रहते हैं? कहें आंध्र प्रदेश, तेलंगाना, महाराष्ट्र, कर्नाटक, तमिलनाडु, या अन्य।', parse: (t) => {
    const states = ['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Karnataka', 'Tamil Nadu']
    const found = states.find((s) => t.toLowerCase().includes(s.toLowerCase()))
    if (found) return found
    if (/आंध्र/.test(t)) return 'Andhra Pradesh'
    if (/तेलंगाना/.test(t)) return 'Telangana'
    if (/महाराष्ट्र/.test(t)) return 'Maharashtra'
    if (/कर्नाटक/.test(t)) return 'Karnataka'
    if (/तमिल/.test(t)) return 'Tamil Nadu'
    if (/\bother\b/.test(t.toLowerCase()) || /अन्य/.test(t)) return 'Other'
    return null
  } },
  { key: 'isBPL', questionEn: 'Do you have a BPL or rice card? Say yes or no.', questionHi: 'क्या आपके पास बीपीएल या राशन कार्ड है? हाँ या नहीं कहें।', parse: yesNo },
  { key: 'isWidow', questionEn: 'Are you a widow or widower? Say yes or no.', questionHi: 'क्या आप विधवा या विधुर हैं? हाँ या नहीं कहें।', parse: yesNo },
  { key: 'disabilityPercent', questionEn: 'What is your disability percentage? Say zero if none.', questionHi: 'आपकी विकलांगता कितने प्रतिशत है? अगर नहीं है तो शून्य कहें।', parse: (t) => { const n = extractNumber(t); return n != null && n >= 0 && n <= 100 ? n : null } },
  { key: 'workerType', questionEn: 'What type of work do you do? Say unorganised, formal, or no work.', questionHi: 'आप किस तरह का काम करते हैं? कहें असंगठित, औपचारिक, या कोई काम नहीं।', parse: (t) => {
    const l = t.toLowerCase()
    if (/\b(unorganised|unorganized|daily wage|labour|labor|farm|vendor|domestic|shop)\b/.test(l) || /मज़दूर|मजदूर|किसान|असंगठित|दिहाड़ी|ठेला/.test(t)) return 'unorganised'
    if (/\b(formal|government|company|office|epfo|pf)\b/.test(l) || /सरकारी|औपचारिक|कंपनी|दफ़्तर/.test(t)) return 'formal'
    if (/\b(no work|not working|retired|none)\b/.test(l) || /कोई काम नहीं|काम नहीं/.test(t)) return 'none'
    return null
  } },
  { key: 'monthlyIncome', questionEn: 'What is your monthly income in rupees? Say zero if none.', questionHi: 'आपकी मासिक आय कितने रुपये है? अगर नहीं है तो शून्य कहें।', parse: (t) => { const n = extractNumber(t); return n != null && n >= 0 ? n : null } },
  { key: 'isTaxpayer', questionEn: 'Do you pay income tax? Say yes or no.', questionHi: 'क्या आप आयकर देते हैं? हाँ या नहीं कहें।', parse: yesNo },
  { key: 'receivingPension', questionEn: 'Are you already receiving a pension? Say yes or no.', questionHi: 'क्या आपको पहले से कोई पेंशन मिल रही है? हाँ या नहीं कहें।', parse: yesNo },
  { key: 'breadwinnerDeath', questionEn: 'Did the main earning member of your family die at age 18 to 59? Say yes or no.', questionHi: 'क्या परिवार के मुख्य कमाने वाले सदस्य की मृत्यु 18 से 59 साल की उम्र में हुई थी? हाँ या नहीं कहें।', parse: yesNo },
]

function speak(text, lang, onEnd) {
  try {
    if (!('speechSynthesis' in window)) { if (onEnd) onEnd(); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'; u.rate = 0.95
    if (onEnd) u.onend = onEnd
    window.speechSynthesis.speak(u)
  } catch { if (onEnd) onEnd() }
}

export default function Profile({ isFirstTime, onSaved, onSkip, authUser }) {
  // Google sign-in info (from the Supabase session in App.jsx, never from a
  // new Supabase call here): user_metadata gives full_name / name, email,
  // and avatar_url / picture. Only the name is used to pre-fill the form,
  // and only when the form name is still empty — a saved or typed name is
  // never overwritten. Nothing is auto-saved: the user reviews the form
  // and presses Save Profile. The profile itself is still saved on this
  // device (storage.js); backend profile sync is not built yet.
  const googleName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || ''
  const googleEmail = authUser?.email || ''
  const googleAvatar = authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || ''
  const isGoogle = authUser?.app_metadata?.provider === 'google'
  const [form, setForm] = useState(() => loadProfile() || EMPTY)
  const [mode, setMode] = useState('manual')
  const [savedMsg, setSavedMsg] = useState('')
  const [voiceStep, setVoiceStep] = useState(-1)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceStatus, setVoiceStatus] = useState('')
  const [voiceLang, setVoiceLang] = useState(() => {
    try { return localStorage.getItem('pensionsaarthi_voice_lang_v1') || 'en' } catch { return 'en' }
  })
  const formRef = useRef(form)
  const googleFilledRef = useRef(false)
  const stepRef = useRef(-1)
  const recRef = useRef(null)
  const voiceLangRef = useRef(voiceLang)
  useEffect(() => { voiceLangRef.current = voiceLang; try { localStorage.setItem('pensionsaarthi_voice_lang_v1', voiceLang) } catch { /* ignore */ } }, [voiceLang])
  const qText = (step) => (voiceLangRef.current === 'hi' ? step.questionHi : step.questionEn)

  useEffect(() => { formRef.current = form }, [form])
  useEffect(() => {
    if (!authUser || !googleName || googleFilledRef.current) return
    googleFilledRef.current = true
    setForm((f) => (f.name ? f : { ...f, name: googleName }))
  }, [authUser, googleName])
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
    const hi = voiceLangRef.current === 'hi'
    if (!SR) {
      setVoiceStatus(hi ? 'इस ब्राउज़र में आवाज़ सुनना समर्थित नहीं है। नीचे मैन्युअल फ़ॉर्म इस्तेमाल करें — वही काम होगा।' : 'Voice listening is not supported in this browser. Please use the manual form below — it works the same way.')
      setVoiceStep(-1); stepRef.current = -1
      return
    }
    const rec = new SR()
    rec.lang = hi ? 'hi-IN' : 'en-IN'; rec.interimResults = false
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      setVoiceTranscript(text)
      const step = STEPS[stepIdx]
      const value = step.parse(text)
      if (value == null) {
        setVoiceStatus(hi ? 'माफ़ कीजिए, समझ नहीं आया। कृपया दोबारा कहें।' : 'Sorry, I did not understand that. Please say it again.')
        speak(hi ? 'माफ़ कीजिए, समझ नहीं आया। कृपया दोबारा कहें।' : 'Sorry, I did not understand that. Please say it again.', voiceLangRef.current, () => listenForStep(stepIdx))
        return
      }
      const nextForm = { ...formRef.current, [step.key]: value }
      formRef.current = nextForm
      setForm(nextForm)
      if (stepIdx + 1 >= STEPS.length) {
        setVoiceStep(-1); stepRef.current = -1
        setVoiceStatus(hi ? 'वॉइस सेटअप पूरा हो गया। नीचे विवरण देखें और Save Profile दबाएं।' : 'Voice setup complete. Please review your details below and press Save Profile.')
        speak(hi ? 'वॉइस सेटअप पूरा हो गया। नीचे विवरण देखें और सेव करें।' : 'Voice setup complete. Please review your details and press Save Profile.', voiceLangRef.current)
        return
      }
      const next = stepIdx + 1
      stepRef.current = next; setVoiceStep(next)
      setVoiceStatus(hi ? `मिल गया: ${value}। अगला सवाल…` : `Got it: ${value}. Next question…`)
      speak(qText(STEPS[next]), voiceLangRef.current, () => listenForStep(next))
    }
    rec.onerror = () => { setVoiceStatus(hi ? 'माइक्रोफ़ोन त्रुटि। अनुमति जांचें, या मैन्युअल फ़ॉर्म इस्तेमाल करें।' : 'Microphone error. Please check microphone permission, or use the manual form.'); setVoiceStep(-1); stepRef.current = -1 }
    recRef.current = rec
    try { rec.start() } catch { /* already started */ }
  }

  const startVoice = () => {
    setMode('voice')
    setVoiceTranscript(''); setVoiceStatus(voiceLangRef.current === 'hi' ? 'वॉइस सेटअप शुरू हो रहा है…' : 'Starting voice setup…')
    stepRef.current = 0; setVoiceStep(0)
    speak(qText(STEPS[0]), voiceLangRef.current, () => listenForStep(0))
  }

  const stopVoice = () => {
    try { recRef.current && recRef.current.stop() } catch { /* ignore */ }
    try { window.speechSynthesis && window.speechSynthesis.cancel() } catch { /* ignore */ }
    setVoiceStep(-1); stepRef.current = -1
    setVoiceStatus(voiceLangRef.current === 'hi' ? 'वॉइस सेटअप रुक गया। नीचे मैन्युअल फ़ॉर्म से जारी रखें।' : 'Voice setup stopped. You can continue with the manual form below.')
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

      {authUser && (
        <div className="card profile-auth-banner">
          {googleAvatar && <img src={googleAvatar} alt="" className="profile-auth-avatar" referrerPolicy="no-referrer" />}
          <div>
            <div className="scheme-name">Signed in as {googleEmail || 'your account'}</div>
            <p className="note" style={{ margin: 0 }}>
              {isGoogle && googleName && !existing?.name
                ? 'Your name was filled from your Google account — review it below and press Save Profile.'
                : 'Profile details below are still saved on this device. Signing in keeps your session; profile sync to the backend is not built yet.'}
            </p>
          </div>
        </div>
      )}

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
              The assistant will ask one question at a time and listen for your answer — in English or Hindi, whichever you pick.
              Works best in Chrome / Edge with microphone permission. If voice does not work,
              switch to "Fill manually" — the result is exactly the same.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className={`btn small ${voiceLang === 'en' ? 'primary' : ''}`} style={{ marginTop: 0 }} onClick={() => setVoiceLang('en')}>English</button>
              <button className={`btn small ${voiceLang === 'hi' ? 'primary' : ''}`} style={{ marginTop: 0 }} onClick={() => setVoiceLang('hi')}>हिन्दी</button>
            </div>
            {voiceStep >= 0 ? (
              <div className="calc-result">
                <div><strong>{voiceLang === 'hi' ? `सवाल ${voiceStep + 1} / ${STEPS.length}:` : `Question ${voiceStep + 1} of ${STEPS.length}:`}</strong> {voiceLang === 'hi' ? STEPS[voiceStep].questionHi : STEPS[voiceStep].questionEn}</div>
                <div className="note" style={{ marginTop: 8 }}>{voiceStatus || (voiceLang === 'hi' ? 'सुन रहा हूँ…' : 'Listening…')}</div>
                {voiceTranscript && <div className="note">{voiceLang === 'hi' ? 'आपने कहा:' : 'You said:'} "{voiceTranscript}"</div>}
                <button className="btn small" style={{ marginTop: 10 }} onClick={stopVoice}>{voiceLang === 'hi' ? 'वॉइस सेटअप रोकें' : 'Stop voice setup'}</button>
              </div>
            ) : (
              <div>
                <button className="btn primary" onClick={startVoice}>🎙 {voiceLang === 'hi' ? 'वॉइस सेटअप शुरू करें' : 'Start Voice Setup'}</button>
                {voiceStatus && <p className="note" style={{ marginTop: 10 }}>{voiceStatus}</p>}
                {voiceTranscript && <p className="note">{voiceLang === 'hi' ? 'आखिरी जवाब:' : 'Last answer:'} "{voiceTranscript}"</p>}
              </div>
            )}
          </div>
        )}

        <div className="form-card" style={{ marginTop: 14 }}>
          <label>Full name<input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your full name" /></label>
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
