import './PatientSelector.css'

export default function PatientSelector({ patients = [], activeId, onSelect }) {
  return (
    <div className="patient-selector">
      <h4>Simulated cases</h4>
      <div className="patient-selector__list">
        {patients.map((p) => (
          <button
            key={p.id}
            className={`patient-selector__item ${activeId === p.id ? 'is-active' : ''}`}
            onClick={() => onSelect(p.id)}
          >
            <span className="patient-selector__dot" style={{ background: p.color }} />
            <span className="patient-selector__text">
              <span className="patient-selector__label">{p.label}</span>
              <span className="patient-selector__note">{p.caseNote}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="patient-selector__disclaimer">
        Simulated / MIMIC-derived data only. No real patient records or PHI.
      </div>
    </div>
  )
}
