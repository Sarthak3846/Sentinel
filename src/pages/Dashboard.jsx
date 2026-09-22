import { useEffect, useMemo, useRef, useState } from 'react'
import { getPatient } from '../data/patients.js'
import PatientSelector from '../components/PatientSelector.jsx'
import RiskChart from '../components/RiskChart.jsx'
import VitalsPanel from '../components/VitalsPanel.jsx'
import AssistantPanel from '../components/AssistantPanel.jsx'
import './Dashboard.css'

export default function Dashboard() {
  const [patientId, setPatientId] = useState('gradual')
  const [index, setIndex] = useState(6)
  const [playing, setPlaying] = useState(true)
  const [showBaseline, setShowBaseline] = useState(true)
  const intervalRef = useRef(null)

  const patient = useMemo(() => getPatient(patientId), [patientId])
  const visibleData = patient.series.slice(0, index + 1)
  const current = patient.series[index]

  useEffect(() => {
    setIndex(6)
    setPlaying(true)
  }, [patientId])

  useEffect(() => {
    if (!playing) return
    intervalRef.current = window.setInterval(() => {
      setIndex((i) => {
        if (i >= patient.series.length - 1) {
          setPlaying(false)
          return i
        }
        return i + 1
      })
    }, 650)
    return () => window.clearInterval(intervalRef.current)
  }, [playing, patient])

  const riskLevel = current.risk >= 60 ? 'high' : current.risk >= 30 ? 'mid' : 'low'
  const riskLabelMap = { low: 'Low risk', mid: 'Watch', high: 'Elevated risk' }

  return (
    <div className="dashboard">
      <div className="dashboard__disclaimer">
        Research / portfolio prototype &middot; simulated data only &middot; not a diagnostic or clinically validated tool
      </div>

      <div className="container dashboard__grid">
        <aside className="dashboard__sidebar">
          <PatientSelector activeId={patientId} onSelect={setPatientId} />
        </aside>

        <section className="dashboard__main">
          <div className="dashboard__toolbar">
            <div>
              <h1>{patient.label} case</h1>
              <p>{patient.caseNote}</p>
            </div>
            <div className="dashboard__controls">
              <label className="dashboard__toggle">
                <input
                  type="checkbox"
                  checked={showBaseline}
                  onChange={(e) => setShowBaseline(e.target.checked)}
                />
                NEWS2 baseline
              </label>
              <button className="btn btn--outline" onClick={() => setPlaying((p) => !p)}>
                {playing ? 'Pause stream' : index >= patient.series.length - 1 ? 'Replay' : 'Resume'}
              </button>
            </div>
          </div>

          <div className={`risk-summary risk-summary--${riskLevel}`}>
            <div>
              <span className="risk-summary__label">{riskLabelMap[riskLevel]}</span>
              <span className="risk-summary__score">{current.risk}<span>/100</span></span>
            </div>
            <div className="risk-summary__meta">
              <span>t = {current.time}</span>
              <span>{playing ? 'streaming\u2026' : 'paused'}</span>
            </div>
          </div>

          <div className="dashboard__card">
            <div className="dashboard__card-head">
              <h3>Deterioration risk score</h3>
              <div className="dashboard__legend">
                <span><i style={{ background: patient.color }} /> Sentinel risk</span>
                {showBaseline && <span><i className="legend-dash" /> NEWS2 baseline</span>}
              </div>
            </div>
            <RiskChart data={visibleData} color={patient.color} showBaseline={showBaseline} />
          </div>

          <div className="dashboard__card">
            <div className="dashboard__card-head">
              <h3>Vitals detail</h3>
              <span className="dashboard__card-sub">current reading</span>
            </div>
            <VitalsPanel point={current} />
          </div>
        </section>

        <aside className="dashboard__assistant">
          <AssistantPanel patient={patient} index={index} />
        </aside>
      </div>
    </div>
  )
}
