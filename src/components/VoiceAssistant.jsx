import React, { useRef, useState } from 'react'

// Voice Assistant for Citizens — a SEPARATE service, not a chatbot bolt-on.
// - Speaks answers aloud (SpeechSynthesis) so citizens who cannot read well can still use it.
// - Listens with the browser SpeechRecognition API (Chrome/Edge). If the browser
//   does not support it, the same commands work as tap buttons — no one is excluded.
// - Never asks for Aadhaar, OTP or passwords. It only navigates and explains.

const COMMANDS = [
  { label: 'My profile', say: 'Opening My Profile. Fill your details once, by voice or by hand, and you will never need to fill them again.', page: 'profile' },
  { label: 'Find my pension', say: 'Opening the Pension Finder. Answer six simple questions to see which pensions you qualify for, and why.', page: 'eligibility' },
  { label: 'Track my pension status', say: 'Opening the Status Tracker. Choose a case to see where your pension has reached, and why it is stuck if it is.', page: 'status' },
  { label: 'My pension stopped', say: 'Opening Why Did My Pension Stop. First check your Life Certificate, then your bank NPCI mapping. I will walk you through each step.', page: 'help' },
  { label: 'Show all schemes', say: 'Opening the Schemes Library. It lists every pension scheme with its real amount and documents.', page: 'schemes' },
  { label: 'Pension calculator', say: 'Opening the Pension Calculator. Enter your age to see how much you would pay and receive under Atal Pension Yojana and PM-SYM.', page: 'calculator' },
  { label: 'Life Certificate reminder', say: 'Opening Reminders. Enter the date you last submitted your Life Certificate to see your next due date.', page: 'reminders' },
  { label: 'Where to get help', say: 'Opening Help Centres. It lists Sachivalayam, MeeSeva, bank and post office help, and what to carry.', page: 'helpcentres' },
]

function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-IN'
    u.rate = 0.95
    window.speechSynthesis.speak(u)
  } catch { /* speech is optional */ }
}

export function speakText(text) { speak(text) }

export default function VoiceAssistant({ go, open, setOpen }) {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [lastAnswer, setLastAnswer] = useState('')
  const recRef = useRef(null)

  const runCommand = (cmd) => {
    setLastAnswer(cmd.say)
    speak(cmd.say)
    if (go) go(cmd.page)
  }

  const handleVoice = (text) => {
    const t = text.toLowerCase()
    setTranscript(text)
    const byPage = (page) => COMMANDS.find((c) => c.page === page)
    let cmd = null
    if (t.includes('profile') || t.includes('my details') || t.includes('fill my details')) cmd = byPage('profile')
    else if (t.includes('stop') || t.includes('not received') || t.includes('not coming') || t.includes('band')) cmd = byPage('help')
    else if (t.includes('status') || t.includes('track') || t.includes('where') && t.includes('pension')) cmd = byPage('status')
    else if (t.includes('find') || t.includes('eligible') || t.includes('qualify') || t.includes('which pension')) cmd = byPage('eligibility')
    else if (t.includes('calculator') || t.includes('how much') || t.includes('pay')) cmd = byPage('calculator')
    else if (t.includes('life certificate') || t.includes('reminder') || t.includes('jeevan')) cmd = byPage('reminders')
    else if (t.includes('help') || t.includes('centre') || t.includes('center') || t.includes('office')) cmd = byPage('helpcentres')
    else if (t.includes('scheme')) cmd = byPage('schemes')
    else if (t.includes('home')) { setLastAnswer('Going back to the home page.'); speak('Going back to the home page.'); if (go) go('home'); return }
    if (cmd) runCommand(cmd)
    else {
      const msg = 'I did not understand that. Try: Find my pension, Track my pension status, or My pension stopped. Or tap a button below.'
      setLastAnswer(msg); speak(msg)
    }
  }

  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      const msg = 'Voice listening is not supported in this browser. Please tap a command button below — it works the same way.'
      setLastAnswer(msg); speak(msg); return
    }
    if (listening && recRef.current) { recRef.current.stop(); setListening(false); return }
    const rec = new SR()
    rec.lang = 'en-IN'
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

  return (
    <>
      <button className="voice-fab" title="Close Voice Assistant" aria-label="Close Voice Assistant" onClick={() => setOpen(false)}>×</button>
      <div className="voice-panel">
        <h3>Voice Assistant for Citizens</h3>
        <p>Speak, or tap a command. Answers are read aloud. No Aadhaar, OTP or password is ever asked.</p>
        <button className={`mic-btn ${listening ? 'listening' : ''}`} onClick={toggleMic}>
          {listening ? 'Listening… Tap to stop' : '🎙 Start Speaking'}
        </button>
        <div className="voice-transcript">
          {transcript ? <><strong>You said:</strong> {transcript}<br /></> : null}
          {lastAnswer || 'Try: "Find my pension" or "My pension stopped".'}
        </div>
        <div className="voice-chips">
          {COMMANDS.map((c) => (
            <button key={c.label} className="voice-chip" onClick={() => runCommand(c)}>{c.label}</button>
          ))}
        </div>
        <p style={{ marginTop: 10 }}>Works best in Chrome / Edge. In other browsers, tap the buttons above.</p>
      </div>
    </>
  )
}
