import './VitalsPanel.css'

// `scale` is the display range for the gauge; `normal` is the healthy band.
const VITALS = [
  { key: 'hr', label: 'Heart rate', unit: 'bpm', normal: [60, 100], scale: [40, 160] },
  { key: 'spo2', label: 'SpO2', unit: '%', normal: [95, 100], scale: [85, 100] },
  { key: 'rr', label: 'Resp. rate', unit: '/min', normal: [12, 20], scale: [6, 36] },
  { key: 'sbp', label: 'Systolic BP', unit: 'mmHg', normal: [100, 130], scale: [70, 180] },
  { key: 'temp', label: 'Temp', unit: '\u00b0C', normal: [36.5, 37.5], scale: [35, 40] },
]

const pct = (v, [lo, hi]) => Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100))

export default function VitalsPanel({ point, prev }) {
  if (!point) return null
  return (
    <div className="vitals-panel">
      {VITALS.map((v) => {
        const value = point[v.key]
        const outOfRange = value < v.normal[0] || value > v.normal[1]
        const delta = prev && typeof prev[v.key] === 'number' ? +(value - prev[v.key]).toFixed(1) : 0
        const bandLeft = pct(v.normal[0], v.scale)
        const bandWidth = pct(v.normal[1], v.scale) - bandLeft
        return (
          <div className={`vital-card ${outOfRange ? 'is-flagged' : ''}`} key={v.key}>
            <div className="vital-card__top">
              <span className="vital-card__label">{v.label}</span>
              {outOfRange && <span className="vital-card__flag">out of range</span>}
            </div>
            <div className="vital-card__row">
              <span className="vital-card__value">
                {value}
                <span className="vital-card__unit">{v.unit}</span>
              </span>
              {delta !== 0 && (
                <span className={`vital-card__delta ${delta > 0 ? 'is-up' : 'is-down'}`}>
                  {delta > 0 ? '\u25B2' : '\u25BC'} {Math.abs(delta)}
                </span>
              )}
            </div>
            <div className="vital-card__gauge" aria-hidden="true">
              <span className="vital-card__band" style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }} />
              <span className="vital-card__marker" style={{ left: `${pct(value, v.scale)}%` }} />
            </div>
            <span className="vital-card__range">normal {v.normal[0]}{'\u2013'}{v.normal[1]}</span>
          </div>
        )
      })}
    </div>
  )
}