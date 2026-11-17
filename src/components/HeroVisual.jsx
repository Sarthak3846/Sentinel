import './HeroVisual.css'

const riskPath = 'M0,140 C60,138 120,134 180,126 S280,100 340,84 S460,50 520,36 S600,20 620,16'
const riskArea = `${riskPath} L620,170 L0,170 Z`
const vitalPath = 'M0,112 L60,108 L120,113 L180,106 L240,110 L300,104 L360,106 L420,100 L480,92 L520,76 L556,50 L590,38 L620,30'

export default function HeroVisual() {
  return (
    <div className="hero-visual">
      <div className="hero-visual__card hero-visual__card--in" aria-hidden="true">
        <span className="hero-visual__tag">Vitals in</span>
        <div className="hero-visual__rows">
          <span><b>HR</b> 112 bpm</span>
          <span><b>SpO2</b> 93 %</span>
          <span><b>RR</b> 22 /min</span>
          <span><b>Temp</b> 37.9 °C</span>
        </div>
      </div>

      <div className="hero-visual__center">
        <div className="hero-visual__glow" aria-hidden="true" />
        <div className="hero-visual__top">
          <span className="hero-visual__title">Deterioration risk · live</span>
          <span className="hero-visual__live"><i /> streaming</span>
        </div>

        <svg
          viewBox="0 0 620 170"
          className="hero-visual__chart"
          role="img"
          aria-label="Deterioration risk score climbing well before a threshold alarm would fire"
        >
          <defs>
            <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#146B73" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#146B73" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[30, 70, 110, 150].map((y) => (
            <line key={y} x1="0" y1={y} x2="620" y2={y} className="hero-visual__gridline" />
          ))}

          <line x1="0" y1="50" x2="620" y2="50" className="hero-visual__threshold" />
          <text x="6" y="44" className="hero-visual__label">fixed threshold</text>

          <path d={riskArea} fill="url(#heroFill)" className="hero-visual__area" />
          <path d={vitalPath} className="hero-visual__vitalline" pathLength="1" />
          <path d={riskPath} className="hero-visual__riskline" pathLength="1" />

          <line x1="340" y1="84" x2="340" y2="160" className="hero-visual__marker" />
          <circle cx="340" cy="84" r="5" className="hero-visual__dot hero-visual__dot--early" />
          <text x="348" y="154" className="hero-visual__label hero-visual__label--brand">Sentinel flags rising risk</text>

          <circle cx="556" cy="50" r="5" className="hero-visual__dot hero-visual__dot--late" />
          <text x="556" y="68" textAnchor="end" className="hero-visual__label hero-visual__label--alarm">alarm fires</text>
        </svg>

        <div className="hero-visual__legend">
          <span><i className="dot dot--risk" /> Sentinel risk score</span>
          <span><i className="dot dot--vital" /> Single vital sign</span>
          <span><i className="dot dot--alarm" /> Threshold alarm</span>
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