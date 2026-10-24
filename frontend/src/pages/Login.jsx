import React, { useState } from 'react'
import { supabase } from '../services/supabaseClient'

// Login gate — shown FIRST, before any navigation or landing page.
// Decided options only, exactly as designed:
//   1. Continue with Google (OAuth)
//   2. Email magic link (no password field, ever)
// No password, no Aadhaar number, no OTP, no bank password, no bank
// account number is ever asked for on this page.
// Google sign-in needs the Google provider enabled in Supabase; until
// then its button shows a friendly fallback and the email link still works.
// Email magic link needs the Email provider ON in Supabase (already set).
// This page does NOT wire profile/status to the backend — that wiring is
// still pending. Signing in only establishes the Supabase session; the
// profile the app uses today is still the device profile (see storage.js).
export default function Login({ onSkip }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [message, setMessage] = useState('')
  const [googleBusy, setGoogleBusy] = useState(false)

  const listenSteps = () => {
    const text = 'Welcome to PensionSaarthi. To sign in, tap Continue with Google, or type your email and tap Send login link. Then open your email and tap the link we sent you. You are then signed in, with no password to remember. We never ask for your Aadhaar number, OTP, bank password, or bank account number.'
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
    } else {
      setMessage('Read-aloud is not supported on this device. The steps are written below.')
    }
  }

  const signInGoogle = async () => {
    if (!supabase) {
      setStatus('error')
      setMessage('Sign-in is not configured in this build. Use “Continue without signing in” to browse, or try on the live site where Supabase is connected.')
      return
    }
    setGoogleBusy(true)
    setStatus('idle')
    setMessage('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    setGoogleBusy(false)
    if (error) {
      setStatus('error')
      setMessage('Google sign-in is not enabled yet. Use the email link below for now — it works with the Email provider that is already on.')
    }
    // On success Supabase redirects to Google and back to this site;
    // App.jsx listens for the signed-in session and then shows Home.
  }

  const sendLink = async () => {
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus('error')
      setMessage('Please type a valid email address, for example example@gmail.com.')
      return
    }
    if (!supabase) {
      setStatus('error')
      setMessage('Sign-in is not configured in this build. Use “Continue without signing in” to browse, or try on the live site where Supabase is connected.')
      return
    }
    setStatus('sending')
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email: value,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      setStatus('error')
      setMessage('We could not send the link. Please check the email address and try again.')
      return
    }
    setStatus('sent')
    setMessage(`Link sent to ${value}. Open your email and tap the link to sign in. Then this page will take you to Home automatically.`)
  }

  return (
    <main className="main login-wrap">
      <h1 className="page-title" style={{ textAlign: 'center' }}>Welcome to PensionSaarthi</h1>
      <p className="hero-sub" style={{ textAlign: 'center', margin: '0 auto 14px' }}>
        Sign in to save your details once, and track your application on any device.
        <br />No password to remember.
      </p>

      <div className="card login-card">
        <button className="btn login-google" type="button" onClick={signInGoogle} disabled={googleBusy}>
          <span className="login-g">G</span> {googleBusy ? 'Opening Google…' : 'Continue with Google'}
        </button>
        <p className="note center">Fastest, if you already use Google on this phone.</p>

        <div className="login-divider"><span>or continue with email</span></div>

        <div className="form-card">
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              autoComplete="email"
              inputMode="email"
            />
          </label>
        </div>
        <button className="btn primary big" type="button" onClick={sendLink} disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send login link'}
        </button>
        <p className="note">We will send a link to your email. Open that email and tap the link to sign in. The link works once, and you do not need a password.</p>

        {message && (
          <div className={status === 'error' ? 'status-banner bad' : 'status-banner'} role="status">
            {message}
          </div>
        )}

        <div className="login-notice">
          <strong>We never ask for:</strong> Aadhaar number, OTP, bank password, or bank account number.
          If anyone asks for these to sign you in, do not share them.
        </div>

        <p className="center" style={{ marginTop: 20 }}>
          <button className="btn ghost" type="button" onClick={onSkip}>Continue without signing in → browse schemes</button>
          <br /><span className="note">You can look at schemes without signing in. Signing in only saves your own details and application.</span>
        </p>
        <p className="center">
          <button className="btn" type="button" onClick={listenSteps}>🎙 Listen to these steps</button>
        </p>
      </div>

      <div className="card">
        <h2 className="section-title" style={{ marginTop: 0 }}>How signing in works</h2>
        <ol className="steps-list">
          <li>Tap “Continue with Google”, or type your email and tap “Send login link”.</li>
          <li>Open your email and tap the link we sent you.</li>
          <li>Done — you are signed in. Next time, fill your details once in My Profile.</li>
        </ol>
        <p className="note">Need help? A family member can help you open the email link. Never share an OTP or password with anyone — PensionSaarthi has no password to share.</p>
      </div>
      <p className="disclaimer center">Not a government website. Final decision is the government officer's.</p>
    </main>
  )
}
