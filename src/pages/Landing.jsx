import { Link } from 'react-router-dom'
import HeroVisual from '../components/HeroVisual.jsx'
import './Landing.css'

const capabilityCards = [
  {
    title: 'Trend, not threshold',
    body: 'A sequence model reads the trajectory of HR, SpO2, RR, BP and temperature together, catching deterioration hours before any single value crosses a hard-coded alarm line.',
  },
  {
    title: 'Grounded explanations',
    body: 'The assistant never free-generates. Every answer is constrained to the vitals window actually on screen, so clinicians get a reason they can check, not a guess.',
  },
  {
    title: 'Benchmarked, not just built',
    body: 'Validated against a gradient-boosted baseline and the clinically established NEWS2 score, so the added complexity has to earn its keep.',
  },
]

const workflowRows = [
  {
    eyebrow: 'Prediction engine',
    title: 'A risk score that updates as vitals stream in',
    body: 'An LSTM/GRU model ingests a rolling window of a patient\u2019s vitals and outputs a continuously updating deterioration risk score \u2014 visible as one live line on the dashboard, no page refresh required.',
    graphic: 'stream',
  },
  {
    eyebrow: 'Explanation layer',
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

export default function Landing() {
  return (
    <div className="landing">
      <section className="hero container">
        <span className="hero__eyebrow">Research &amp; portfolio prototype</span>
        <h1 className="hero__title">
          Catch deterioration before
          <br />
          a threshold ever fires
        </h1>
        <p className="hero__subtitle">
          Sentinel pairs a trend-based deep learning risk model with an AI assistant
          that explains its reasoning in plain language \u2014 grounded in the vitals
          you can actually see.
        </p>
        <div className="hero__actions">
          <Link to="/demo" className="btn btn--primary btn--lg">Open the live dashboard</Link>
          <Link to="/about" className="btn btn--outline btn--lg">Read the research brief</Link>
        </div>

        <HeroVisual />
      </section>

      <section className="tagline container">
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
        {capabilityCards.map((c) => (
          <div className="capability__card" key={c.title}>
            <div className="capability__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 17L9 12L13 15L20 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
        ))}
      </section>

      <section id="how-it-works" className="bento container">
        <div className="section-head">
          <h2>Built for every reviewer of the demo</h2>
          <p>A recruiter, a hackathon judge, and the builder himself all get something different from the same three-screen flow.</p>
        </div>

        <div className="bento__grid">
          <div className="bento__cell bento__cell--wide">
            <span className="bento__label">Landing \u2192 dashboard \u2192 assistant</span>
            <h3>Understandable in under 60 seconds</h3>
            <p>The core idea \u2014 trend beats threshold \u2014 is visible on the chart within the first minute, with no narration required.</p>
          </div>
          <div className="bento__cell bento__cell--stat">
            <span className="stat-big">95%</span>
            <p>of the demo flow runs on simulated, replayed vitals \u2014 zero live hospital integration required</p>
          </div>
          <div className="bento__cell">
            <span className="bento__label">For recruiters</span>
            <h3>Judge technical depth fast</h3>
            <p>Model, backend, and explanation layer are all visible in one flow.</p>
          </div>
          <div className="bento__cell">
            <span className="bento__label">For judges</span>
            <h3>See why the LLM adds value</h3>
            <p>Not novelty \u2014 grounded reasoning over a model most teams leave as a black box.</p>
          </div>
        </div>
      </section>

      {workflowRows.map((row, i) => (
        <section className="workflow container" key={row.title}>
          <div className={`workflow__row ${i % 2 === 1 ? 'workflow__row--reverse' : ''}`}>
            <div className="workflow__text">
              <span className="workflow__eyebrow">{row.eyebrow}</span>
              <h3>{row.title}</h3>
              <p>{row.body}</p>
              <Link to="/demo" className="workflow__link">Try it on the dashboard &rarr;</Link>
            </div>
            <div className="workflow__graphic">
              {row.graphic === 'stream' ? <StreamGraphic /> : <ChatGraphic />}
            </div>
          </div>
        </section>
      ))}

      <section id="research" className="quote container">
        <blockquote>
          &ldquo;Deterioration is usually visible in the trend of multiple vitals hours
          before any single value crosses a fixed threshold. Sentinel is built around
          that one idea.&rdquo;
        </blockquote>
        <div className="quote__stats">
          {stats.map((s) => (
            <div className="quote__stat" key={s.label}>
              <span className="quote__value">{s.value}</span>
              <span className="quote__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="assistant" className="cta container">
        <div className="cta__panel">
          <h2>See the risk score diverge from a threshold alarm</h2>
          <p>Pick a simulated case, watch the vitals stream, and ask the assistant why the score is moving.</p>
          <Link to="/demo" className="btn btn--primary btn--lg">Open the live dashboard</Link>
        </div>
      </section>
    </div>
  )
}

function StreamGraphic() {
  return (
    <div className="graphic-card">
      <div className="graphic-card__head">
        <span>Live risk score</span>
        <span className="graphic-card__badge">streaming</span>
      </div>
      <svg viewBox="0 0 320 120" className="graphic-card__svg">
        <polyline points="0,95 40,92 80,85 120,78 160,60 200,48 240,30 280,18 320,10" className="graphic-card__line" />
        <polyline points="0,95 40,92 80,85 120,78 160,60 200,48 240,30 280,18 320,10" className="graphic-card__area" />
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
        window \u2014 consistent with early respiratory decompensation.
      </div>
    </div>
  )
}
