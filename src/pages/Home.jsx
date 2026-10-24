import React from 'react'

export default function Home({ go }) {
  return (
    <div>
      <h1 className="hero">Pension, bina bhatke.</h1>
      <p className="hero-sub">
        Kaunsi pension aapke liye banti hai, paisa kahan atka hai, aur pension band hui to
        theek kaise hogi — sab kuch badi, saaf bhasha me. Jhooti umeed nahi, pakki wajah ke saath.
      </p>

      <div className="home-grid">
        <button className="big-card" onClick={() => go('eligibility')}>
          <span className="big-card-title">1 · Meri Pension Dhundo</span>
          <span>6 aasan sawal — hum batayenge kaunsi pension banti hai, kitni milegi, aur kaunsi kagaz chahiye.</span>
        </button>
        <button className="big-card" onClick={() => go('status')}>
          <span className="big-card-title">2 · Meri Pension Ka Status</span>
          <span>Apply kiya tha — paisa kahan tak pahuncha? Ek hi seedhi line me dekho, atka hai to wajah ke saath.</span>
        </button>
        <button className="big-card accent" onClick={() => go('help')}>
          <span className="big-card-title">3 · Pension Band Kyun Hua?</span>
          <span>Pension ruk gayi hai? Apni dikkat chuno — hum wajah aur theek karne ka pura tareeka batayenge.</span>
        </button>
        <button className="big-card" onClick={() => go('schemes')}>
          <span className="big-card-title">Saari Pension Yojanayein</span>
          <span>Sarkari, rajya aur bachat wali — saari yojana ek jagah, asli rakam aur niyamo ke saath.</span>
        </button>
      </div>

      <div className="card helper-card">
        <div className="scheme-name">Family Helper Mode</div>
        <p className="note">
          Maa-pita ke liye unke bacche bhi ye sab apne phone se kar sakte hain —
          <strong> bina unka OTP ya password maange.</strong> Isiliye ye app unke naam aur
          jaankari se chalta hai, unke khaate se nahi.
        </p>
      </div>

      <p className="disclaimer">
        Note: Ye app sarkari nahi hai. Eligibility "likely" batayi jati hai — aakhri faisla
        sarkari adhikari ka hota hai. Rakam: jahan "central share" likha hai, wahan rajya apna hissa aur jodta hai.
      </p>
    </div>
  )
}
