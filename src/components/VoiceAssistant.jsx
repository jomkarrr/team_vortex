import React, { useEffect, useRef, useState } from 'react'
import { NAV_INTENTS, matchVoiceCommand, navButtonNames } from '../lib/voiceIntents'

// Voice Assistant for Citizens — bilingual (English + Hindi) and trained on
// EVERY navigation button by name (see src/lib/voiceIntents.js).
// It no longer guesses from one keyword: it matches the longest spoken
// phrase first ("where to get help" -> Help & Grievance, not Track Status),
// and shows what it understood before opening the page, so a wrong order
// is visible instantly instead of silently opening the wrong screen.
// Tap commands work the same way when speech is unsupported, and it never
// asks for Aadhaar, OTP or passwords.

const LANG_KEY = 'pensionsaarthi_voice_lang_v1'

function speak(text, lang) {
  try {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    u.rate = 0.95
    window.speechSynthesis.speak(u)
  } catch { /* speech is optional */ }
}

export function speakText(text, lang) { speak(text, lang === 'hi' ? 'hi' : 'en') }

export default function VoiceAssistant({ go, open, setOpen, onMore, onFontSize }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || 'en' } catch { return 'en' }
  })
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [lastAnswer, setLastAnswer] = useState('')
  const [understood, setUnderstood] = useState('')
  const recRef = useRef(null)
  const langRef = useRef(lang)

  useEffect(() => { langRef.current = lang; try { localStorage.setItem(LANG_KEY, lang) } catch { /* ignore */ } }, [lang])

  const say = (text) => speak(text, langRef.current)
  const labelOf = (intent) => (langRef.current === 'hi' ? intent.labelHi : intent.labelEn)
  const sayOf = (intent) => (langRef.current === 'hi' ? intent.sayHi : intent.sayEn)

  const runIntent = (intent) => {
    const text = sayOf(intent)
    setUnderstood(labelOf(intent))
    setLastAnswer(text)
    say(text)
    if (intent.action === 'more') { if (onMore) onMore(); return }
    if (intent.action === 'font') { if (onFontSize) onFontSize(); return }
    if (intent.page && go) go(intent.page)
  }

  const handleVoice = (text) => {
    setTranscript(text)
    const match = matchVoiceCommand(text)
    if (match) { runIntent(match.intent); return }
    const hi = langRef.current === 'hi'
    const msg = hi
      ? `मैं समझ नहीं पाया। ये नाम कहें: ${navButtonNames('hi')}।`
      : `I did not catch a service name. Try one of these: ${navButtonNames('en')}.`
    setUnderstood('')
    setLastAnswer(msg); say(msg)
  }

  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      const msg = langRef.current === 'hi'
        ? 'इस ब्राउज़र में आवाज़ सुनना समर्थित नहीं है। नीचे बटन दबाएं — वही काम होगा।'
        : 'Voice listening is not supported in this browser. Please tap a command button below — it works the same way.'
      setLastAnswer(msg); say(msg); return
    }
    if (listening && recRef.current) { recRef.current.stop(); setListening(false); return }
    const rec = new SR()
    rec.lang = langRef.current === 'hi' ? 'hi-IN' : 'en-IN'
    rec.interimResults = false
    rec.onresult = (e) => handleVoice(e.results[0][0].transcript)
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    setListening(true)
    rec.start()
  }

  if (!open) {
    return (
      <button className="voice-fab" title="Voice Assistant for Citizens" aria-label="Open Voice Assistant" onClick={() => setOpen(true)}>
        🎙
      </button>
    )
  }

  const hi = lang === 'hi'
  return (
    <>
      <button className="voice-fab" title="Close Voice Assistant" aria-label="Close Voice Assistant" onClick={() => setOpen(false)}>×</button>
      <div className="voice-panel">
        <h3>{hi ? 'नागरिकों के लिए वॉइस असिस्टेंट' : 'Voice Assistant for Citizens'}</h3>
        <p>{hi
          ? 'पहले भाषा चुनें, फिर किसी भी नेविगेशन बटन का नाम बोलें — मैं तुरंत समझकर वही पेज खोल दूंगा। आधार, ओटीपी या पासवर्ड कभी नहीं मांगा जाएगा।'
          : 'Pick a language first, then say any navigation button name — I will understand it at once and open that page. No Aadhaar, OTP or password is ever asked.'}</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button className={`btn small ${lang === 'en' ? 'primary' : ''}`} style={{ marginTop: 0 }} onClick={() => setLang('en')}>English</button>
          <button className={`btn small ${lang === 'hi' ? 'primary' : ''}`} style={{ marginTop: 0 }} onClick={() => setLang('hi')}>हिन्दी</button>
        </div>
        <button className={`mic-btn ${listening ? 'listening' : ''}`} onClick={toggleMic}>
          {listening ? (hi ? 'सुन रहा हूँ… रोकने के लिए दबाएं' : 'Listening… Tap to stop') : (hi ? '🎙 बोलना शुरू करें' : '🎙 Start Speaking')}
        </button>
        <div className="voice-transcript">
          {transcript ? <><strong>{hi ? 'आपने कहा:' : 'You said:'}</strong> {transcript}<br /></> : null}
          {understood ? <><strong>{hi ? 'समझा गया:' : 'Understood:'}</strong> {understood} ✓<br /></> : null}
          {lastAnswer || (hi ? 'कोशिश करें: "मेरी पेंशन का स्टेटस", "कैलकुलेटर", या "मदद कहाँ मिलेगी"।' : 'Try: "Track Status", "Calculator", or "Where to get help".')}
        </div>
        <div className="voice-chips">
          {NAV_INTENTS.map((c) => (
            <button key={c.labelEn} className="voice-chip" onClick={() => runIntent(c)}>{hi ? c.labelHi : c.labelEn}</button>
          ))}
        </div>
        <p style={{ marginTop: 10 }}>{hi ? 'ऊपर हर नेविगेशन बटन का नाम है — वही नाम बोलें, वही पेज खुलेगा। Chrome / Edge में सबसे अच्छा चलता है।' : 'Every navigation button name is above as a button — say that exact name and that page opens. Works best in Chrome / Edge.'}</p>
      </div>
    </>
  )
}
