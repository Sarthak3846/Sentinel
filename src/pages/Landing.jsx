import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroVisual from '../components/HeroVisual.jsx'
import './Landing.css'

const icons = {
  trend: <path d="M4 17L9 12L13 15L20 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  shield: (
    <>
      <path d="M12 3L5 6V11.5C5 16 8 19.8 12 21C16 19.8 19 16 19 11.5V6L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 12L11.2 14.2L15 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  bench: (
    <>
      <path d="M5 20V11M12 20V5M19 20V14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </>
  ),
}

const capabilityCards = [
  {
    icon: 'trend',
    title: 'Trend, not threshold',
    body: 'A sequence model reads the trajectory of HR, SpO2, RR, BP and temperature together, catching deterioration hours before any single value crosses a hard-coded alarm line.',
  },
  {
    icon: 'shield',
    title: 'Grounded explanations',
    body: 'The assistant never free-generates. Every answer is constrained to the vitals window actually on screen, so clinicians get a reason they can check, not a guess.',
  },
  {
    icon: 'bench',
    title: 'Benchmarked, not just built',
    body: 'Validated against a gradient-boosted baseline and the clinically established NEWS2 score, so the added complexity has to earn its keep.',
  },
]

const workflowRows = [
  {
    eyebrow: '01 · Prediction engine',
    title: 'A risk score that updates as vitals stream in',
    body: 'An LSTM/GRU model ingests a rolling window of a patient\u2019s vitals and outputs a continuously updating deterioration risk score \u2014 visible as one live line on the dashboard, no page refresh required.',
    graphic: 'stream',
  },
  {
    eyebrow: '02 · Explanation layer',
    title: 'Ask why the score moved, get an answer grounded in data',
    body: 'The chat panel is scoped to the current patient and current window. Ask \u201cwhy is this climbing?\u201d and the assistant answers from the retrieved vitals trend \u2014 never from memory or plausible-sounding filler.',
    graphic: 'chat',
  },
]

const stats = [
  { value: '3', label: 'Simulated patient cases: stable, gradual, rapid decline' },
  { value: '5', label: 'Vitals streamed continuously: HR, SpO2, RR, BP, temp' },
  { value: '0', label: 'Real patient records used \u2014 simulated / MIMIC-derived only' },
]

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export default function Landing() {
  useReveal()

  return (
    <div className="landing">
      <section className="hero container">
        <span className="hero__eyebrow"><i /> Research &amp; portfolio prototype</span>
        <h1 className="hero__title">
          Catch deterioration <span className="accent">before</span>
          <br />
          a threshold ever fires
        </h1>
        <p className="hero__subtitle">
          Sentinel pairs a trend-based deep learning risk model with an AI assistant
          that explains its reasoning in plain language — grounded in the vitals
          you can actually see.
        </p>
        <div className="hero__actions">
          <Link to="/demo" className="btn btn--primary btn--lg">
            Open the live dashboard
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link to="/about" className="btn btn--outline btn--lg">Read the research brief</Link>
        </div>
        <p className="hero__note">Simulated data only · No PHI · Not a diagnostic tool</p>

        <HeroVisual />
      </section>

      <section className="tagline container reveal">
        <h2 className="tagline__text">
          Built for <span className="tagline__chip">ICU vitals</span>
          <span className="tagline__chip">grounded LLMs</span>
          <span className="tagline__chip">NEWS2</span> monitoring
        </h2>
        <p className="tagline__sub">
          A prediction engine and an explanation layer, designed to work as one system.
        </p>
      </section>

      <section id="product" className="capability container">
        {capabilityCards.map((c, i) => (
          <div className="capability__card reveal" style={{ '--d': `${i * 90}ms` }} key={c.title}>
            <div className="capability__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">{icons[c.icon]}</svg>
            </div>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
        ))}
      </section>

      <section id="how-it-works" className="bento container">
        <div className="section-head reveal">
          <span className="section-head__eyebrow">How it works</span>
          <h2>Built for every <span className="accent">reviewer</span> of the demo</h2>
          <p>A recruiter, a hackathon judge, and the builder himself all get something different from the same three-screen flow.</p>
        </div>

        <div className="bento__grid">
          <div className="bento__cell bento__cell--wide reveal">
            <span className="bento__label">Landing → dashboard → assistant</span>
            <h3>Understandable in under 60 seconds</h3>
            <p>The core idea — trend beats threshold — is visible on the chart within the first minute, with no narration required.</p>
            <div className="bento__flow" aria-hidden="true">
              <span>Land</span><i />
              <span>Watch vitals</span><i />
              <span>Ask why</span>
            </div>
          </div>
          <div className="bento__cell bento__cell--stat reveal" style={{ '--d': '90ms' }}>
            <span className="stat-big">95%</span>
            <p>of the demo flow runs on simulated, replayed vitals — zero live hospital integration required</p>
          </div>
          <div className="bento__cell reveal" style={{ '--d': '60ms' }}>
            <span className="bento__label">For recruiters</span>
            <h3>Judge technical depth fast</h3>
            <p>Model, backend, and explanation layer are all visible in one flow.</p>
          </div>
          <div className="bento__cell reveal" style={{ '--d': '120ms' }}>
            <span className="bento__label">For judges</span>
            <h3>See why the LLM adds value</h3>
            <p>Not novelty — grounded reasoning over a model most teams leave as a black box.</p>
          </div>
        </div>
      </section>

      {workflowRows.map((row, i) => (
        <section className="workflow container" key={row.title}>
          <div className={`workflow__row reveal ${i % 2 === 1 ? 'workflow__row--reverse' : ''}`}>
            <div className="workflow__text">
              <span className="workflow__eyebrow">{row.eyebrow}</span>
              <h3>{row.title}</h3>
              <p>{row.body}</p>
              <Link to="/demo" className="workflow__link">Try it on the dashboard <span aria-hidden="true">→</span></Link>
            </div>
            <div className="workflow__graphic">
              {row.graphic === 'stream' ? <StreamGraphic /> : <ChatGraphic />}
            </div>
          </div>
        </section>
      ))}

      <section id="research" className="quote container">
        <blockquote className="reveal">
          &ldquo;Deterioration is usually visible in the trend of multiple vitals hours
          before any single value crosses a fixed threshold. Sentinel is built around
          that <span className="accent">one idea</span>.&rdquo;
        </blockquote>
        <div className="quote__stats">
          {stats.map((s, i) => (
            <div className="quote__stat reveal" style={{ '--d': `${i * 90}ms` }} key={s.label}>
              <span className="quote__value">{s.value}</span>
              <span className="quote__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="assistant" className="cta container">
        <div className="cta__panel reveal">
          <h2>See the risk score diverge from a threshold alarm</h2>
          <p>Pick a simulated case, watch the vitals stream, and ask the assistant why the score is moving.</p>
          <Link to="/demo" className="btn btn--primary btn--lg">Open the live dashboard</Link>
        </div>
      </section>
    </div>
  )
}

function StreamGraphic() {
  const pts = '0,95 40,92 80,85 120,78 160,60 200,48 240,30 280,18 320,10'
  return (
    <div className="graphic-card">
      <div className="graphic-card__head">
        <span>Live risk score</span>
        <span className="graphic-card__badge"><i /> streaming</span>
      </div>
      <svg viewBox="0 0 320 120" className="graphic-card__svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gcFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#146B73" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#146B73" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`${pts} 320,120 0,120`} fill="url(#gcFill)" />
        <polyline points={pts} className="graphic-card__line" />
        <circle cx="320" cy="10" r="4.5" fill="#DD5B3E" stroke="#fff" strokeWidth="2" />
      </svg>
      <div className="graphic-card__foot">
        <span>HR 118</span><span>SpO2 91%</span><span>RR 24</span>
      </div>
    </div>
  )
}

function ChatGraphic() {
  return (
    <div className="graphic-card graphic-card--chat">
      <div className="chat-bubble chat-bubble--user">Why is the score rising?</div>
      <div className="chat-bubble chat-bubble--ai">
        RR is up 15% over the last 3 readings and SpO2 has dropped 6 points in the same
        window — consistent with early respiratory decompensation.
      </div>
      <div className="chat-bubble__source">Grounded in: RR, SpO2 · last 3 readings</div>
    </div>
  )
}