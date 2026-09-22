import './HeroVisual.css'

const alarmPath = "M0,60 L120,60 L130,20 L145,95 L160,60 L620,60"
const riskPath = "M0,85 L90,82 L160,78 L230,70 L300,64 L370,50 L440,38 L510,24 L580,14 L620,10"

export default function HeroVisual() {
  return (
    <div className="hero-visual">
      <div className="hero-visual__card hero-visual__card--in" aria-hidden="true">
        <span className="hero-visual__tag">Vitals in</span>
        <div className="hero-visual__rows">
          <span>HR · SpO2</span>
          <span>RR · Temp</span>
          <span>BP · Trend</span>
        </div>
      </div>

      <div className="hero-visual__center">
        <div className="hero-visual__glow" aria-hidden="true" />
        <svg viewBox="0 0 620 120" className="hero-visual__chart" role="img" aria-label="Deterioration risk score climbing well before a threshold alarm would fire">
          <line x1="0" y1="95" x2="620" y2="95" className="hero-visual__gridline" />
          <path d={alarmPath} className="hero-visual__alarmline" />
          <path d={riskPath} className="hero-visual__riskline" />
          <circle cx="580" cy="14" r="5" className="hero-visual__dot" />
        </svg>
        <div className="hero-visual__legend">
          <span><i className="dot dot--risk" /> Sentinel risk score</span>
          <span><i className="dot dot--alarm" /> Fixed threshold alarm</span>
        </div>
      </div>

      <div className="hero-visual__card hero-visual__card--out" aria-hidden="true">
        <span className="hero-visual__tag">Explained</span>
        <p>
          &ldquo;RR up 15% over 3h, SpO2 trending down — early signs of
          respiratory decompensation.&rdquo;
        </p>
      </div>
    </div>
  )
}
