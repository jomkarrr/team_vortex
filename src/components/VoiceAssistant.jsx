import React, { useEffect, useRef, useState } from 'react'

// Voice Assistant for Citizens — now bilingual: English + Hindi.
// The user picks a language first; recognition AND spoken answers both switch
// to that language (en-IN / hi-IN). Tap commands work in either language and
// never ask for Aadhaar, OTP or passwords. If speech is unsupported, the same
// commands work as tap buttons — no one is excluded.

const LANG_KEY = 'pensionsaarthi_voice_lang_v1'

const COMMANDS = [
  { page: 'profile',
    labelEn: 'My profile', labelHi: 'मेरी प्रोफ़ाइल',
    sayEn: 'Opening My Profile. Fill your details once, by voice or by hand, and you will never need to fill them again.',
    sayHi: 'मेरी प्रोफ़ाइल खुल रही है। अपनी जानकारी एक बार भर दें, दोबारा भरने की ज़रूरत नहीं पड़ेगी।' },
  { page: 'eligibility',
    labelEn: 'Find my pension', labelHi: 'मेरी पेंशन ढूंढें',
    sayEn: 'Opening the Pension Finder. Answer six simple questions to see which pensions you qualify for, and why.',
    sayHi: 'पेंशन खोज खुल रही है। कुछ सरल सवालों के जवाब दें, और देखें आप किस पेंशन के लिए योग्य हैं, और क्यों।' },
  { page: 'status',
    labelEn: 'Track my pension status', labelHi: 'मेरी पेंशन का स्टेटस',
    sayEn: 'Opening the Status Tracker. You will see only your own application timeline — no other user\'s details are shown.',
    sayHi: 'स्टेटस ट्रैकर खुल रहा है। यहाँ सिर्फ़ आपकी अपनी आवेदन की जानकारी दिखेगी, किसी और की नहीं।' },
  { page: 'help',
    labelEn: 'My pension stopped', labelHi: 'मेरी पेंशन रुक गई',
    sayEn: 'Opening Why Did My Pension Stop. First check your Life Certificate, then your bank NPCI mapping. I will walk you through each step.',
    sayHi: 'पेंशन रुकने का कारण देख रहे हैं। पहले लाइफ़ सर्टिफ़िकेट देखें, फिर बैंक का एनपीसीआई मैपिंग। हर कदम समझाया जाएगा।' },
  { page: 'schemes',
    labelEn: 'Show all schemes', labelHi: 'सभी योजनाएं',
    sayEn: 'Opening the Schemes Library. It lists every pension scheme with its real amount and documents.',
    sayHi: 'सभी पेंशन योजनाएं खुल रही हैं, असली राशि और काग़ज़ों के साथ।' },
  { page: 'calculator',
    labelEn: 'Pension calculator', labelHi: 'पेंशन कैलकुलेटर',
    sayEn: 'Opening the Pension Calculator. Enter your age to see how much you would pay and receive under Atal Pension Yojana and PM-SYM.',
    sayHi: 'पेंशन कैलकुलेटर खुल रहा है। अपनी उम्र डालें और देखें अटल पेंशन योजना और पीएम-एसवाईएम में कितना देना और कितना मिलेगा।' },
  { page: 'reminders',
    labelEn: 'Life Certificate reminder', labelHi: 'लाइफ़ सर्टिफ़िकेट रिमाइंडर',
    sayEn: 'Opening Reminders. Enter the date you last submitted your Life Certificate to see your next due date.',
    sayHi: 'रिमाइंडर खुल रहा है। पिछली लाइफ़ सर्टिफ़िकेट की तारीख़ डालें, अगली तारीख़ मिल जाएगी।' },
  { page: 'helpcentres',
    labelEn: 'Where to get help', labelHi: 'मदद कहाँ मिलेगी',
    sayEn: 'Opening Help Centres. It lists Sachivalayam, MeeSeva, bank and post office help, and what to carry.',
    sayHi: 'मदद केंद्र खुल रहे हैं — सचिवालय, मीसेवा, बैंक और डाकघर, और क्या लेकर जाना है।' },
]

// Keywords per page: English + Roman Hindi + Devanagari Hindi
const KEYWORDS = {
  profile: ['profile', 'my details', 'fill my details', 'meri profile', 'मेरी प्रोफ़ाइल', 'प्रोफ़ाइल'],
  help: ['stop', 'not received', 'not coming', 'band', 'ruk gayi', 'ruk gai', 'रुक', 'बंद', 'नहीं मिली'],
  status: ['status', 'track', 'where', 'meri pension kahan', 'kahan tak', 'स्थिति', 'स्टेटस'],
  eligibility: ['find', 'eligible', 'qualify', 'which pension', 'dhoondo', 'khojo', 'kaunsi pension', 'कौन सी पेंशन', 'योग्य'],
  calculator: ['calculator', 'how much', 'pay', 'kitna', 'कैलकुलेटर', 'कितना'],
  reminders: ['life certificate', 'reminder', 'jeevan', 'जीवन प्रमाण'],
  helpcentres: ['help', 'centre', 'center', 'office', 'madad', 'kendra', 'मदद', 'केंद्र'],
  schemes: ['scheme', 'yojana', 'yojanayen', 'योजना'],
}

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

export default function VoiceAssistant({ go, open, setOpen }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(LANG_KEY) || 'en' } catch { return 'en' }
  })
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [lastAnswer, setLastAnswer] = useState('')
  const recRef = useRef(null)
  const langRef = useRef(lang)

  useEffect(() => { langRef.current = lang; try { localStorage.setItem(LANG_KEY, lang) } catch { /* ignore */ } }, [lang])

  const say = (text) => speak(text, langRef.current)
  const runCommand = (cmd) => {
    const text = langRef.current === 'hi' ? cmd.sayHi : cmd.sayEn
    setLastAnswer(text); say(text)
    if (go) go(cmd.page)
  }

  const handleVoice = (text) => {
    const t = text.toLowerCase()
    setTranscript(text)
    const byPage = (page) => COMMANDS.find((c) => c.page === page)
    let cmd = null
    for (const [page, words] of Object.entries(KEYWORDS)) {
      if (words.some((w) => t.includes(w.toLowerCase()))) { cmd = byPage(page); break }
    }
    if (!cmd && (t.includes('home') || t.includes('ghar') || t.includes('होम'))) {
      const msg = langRef.current === 'hi' ? 'होम पेज पर वापस जा रहे हैं।' : 'Going back to the home page.'
      setLastAnswer(msg); say(msg); if (go) go('home'); return
    }
    if (cmd) runCommand(cmd)
    else {
      const msg = langRef.current === 'hi'
        ? 'मैं समझ नहीं पाया। कोशिश करें: मेरी पेंशन ढूंढें, मेरी पेंशन का स्टेटस, या मेरी पेंशन रुक गई। या नीचे बटन दबाएं।'
        : 'I did not understand that. Try: Find my pension, Track my pension status, or My pension stopped. Or tap a button below.'
      setLastAnswer(msg); say(msg)
    }
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
          ? 'पहले भाषा चुनें, फिर बोलें या बटन दबाएं। जवाब बोलकर सुनाया जाएगा। आधार, ओटीपी या पासवर्ड कभी नहीं मांगा जाएगा।'
          : 'Pick a language first, then speak or tap a command. Answers are read aloud. No Aadhaar, OTP or password is ever asked.'}</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button className={`btn small ${lang === 'en' ? 'primary' : ''}`} style={{ marginTop: 0 }} onClick={() => setLang('en')}>English</button>
          <button className={`btn small ${lang === 'hi' ? 'primary' : ''}`} style={{ marginTop: 0 }} onClick={() => setLang('hi')}>हिन्दी</button>
        </div>
        <button className={`mic-btn ${listening ? 'listening' : ''}`} onClick={toggleMic}>
          {listening ? (hi ? 'सुन रहा हूँ… रोकने के लिए दबाएं' : 'Listening… Tap to stop') : (hi ? '🎙 बोलना शुरू करें' : '🎙 Start Speaking')}
        </button>
        <div className="voice-transcript">
          {transcript ? <><strong>{hi ? 'आपने कहा:' : 'You said:'}</strong> {transcript}<br /></> : null}
          {lastAnswer || (hi ? 'कोशिश करें: "मेरी पेंशन ढूंढें" या "मेरी पेंशन रुक गई"।' : 'Try: "Find my pension" or "My pension stopped".')}
        </div>
        <div className="voice-chips">
          {COMMANDS.map((c) => (
            <button key={c.page} className="voice-chip" onClick={() => runCommand(c)}>{hi ? c.labelHi : c.labelEn}</button>
          ))}
        </div>
        <p style={{ marginTop: 10 }}>{hi ? 'Chrome / Edge में सबसे अच्छा चलता है। दूसरे ब्राउज़र में बटन दबाएं।' : 'Works best in Chrome / Edge. In other browsers, tap the buttons above.'}</p>
      </div>
    </>
  )
}
