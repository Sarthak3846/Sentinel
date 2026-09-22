import './VitalsPanel.css'

const VITALS = [
  { key: 'hr', label: 'Heart rate', unit: 'bpm', normal: [60, 100] },
  { key: 'spo2', label: 'SpO2', unit: '%', normal: [95, 100] },
  { key: 'rr', label: 'Resp. rate', unit: '/min', normal: [12, 20] },
  { key: 'sbp', label: 'Systolic BP', unit: 'mmHg', normal: [100, 130] },
  { key: 'temp', label: 'Temp', unit: '\u00b0C', normal: [36.5, 37.5] },
]

export default function VitalsPanel({ point }) {
  if (!point) return null
  return (
    <div className="vitals-panel">
      {VITALS.map((v) => {
        const value = point[v.key]
        const outOfRange = value < v.normal[0] || value > v.normal[1]
        return (
          <div className={`vital-card ${outOfRange ? 'is-flagged' : ''}`} key={v.key}>
            <span className="vital-card__label">{v.label}</span>
            <span className="vital-card__value">
              {value}
              <span className="vital-card__unit">{v.unit}</span>
            </span>
            <span className="vital-card__range">normal {v.normal[0]}\u2013{v.normal[1]}</span>
          </div>
        )
      })}
    </div>
  )
}
