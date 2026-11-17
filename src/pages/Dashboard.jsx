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
  const prev = patient.series[Math.max(index - 1, 0)]
  const lastIndex = patient.series.length - 1
  const atEnd = index >= lastIndex

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
  const progress = lastIndex > 0 ? (index / lastIndex) * 100 : 0
  const diff = current.risk - prev.risk

  function togglePlay() {
    if (atEnd) {
      setIndex(6)
      setPlaying(true)
    } else {
      setPlaying((p) => !p)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard__disclaimer">
        <span className="dashboard__disclaimer-dot" />
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
                <span className="dashboard__switch" aria-hidden="true" />
                NEWS2 baseline
              </label>
              <button className="btn btn--outline" onClick={togglePlay}>
                {playing ? (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1.5"/><rect x="14" y="4" width="5" height="16" rx="1.5"/></svg>Pause stream</>
                ) : (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5V19.5L19 12L7 4.5Z"/></svg>{atEnd ? 'Replay' : 'Resume'}</>
                )}
              </button>
            </div>
          </div>

          <div className={`risk-summary risk-summary--${riskLevel}`}>
            <div className="risk-summary__left">
              <span className="risk-summary__pill">
                <i /> {riskLabelMap[riskLevel]}
              </span>
              <span className="risk-summary__score">
                {current.risk}<span>/100</span>
              </span>
              <span className={`risk-summary__delta ${diff > 0 ? 'is-up' : diff < 0 ? 'is-down' : ''}`}>
                {diff > 0 ? '\u25B2' : diff < 0 ? '\u25BC' : '\u2014'} {Math.abs(diff)} since last reading
              </span>
            </div>
            <div className="risk-summary__right">
              <div className="risk-summary__meter" aria-hidden="true">
                <span className="risk-summary__zone risk-summary__zone--low" />
                <span className="risk-summary__zone risk-summary__zone--mid" />
                <span className="risk-summary__zone risk-summary__zone--high" />
                <span className="risk-summary__needle" style={{ left: `${Math.min(100, current.risk)}%` }} />
              </div>
              <div className="risk-summary__meta">
                <span>t = {current.time}</span>
                <span className="risk-summary__status">
                  <i className={playing ? 'is-live' : ''} />
                  {playing ? 'streaming\u2026' : 'paused'}
                </span>
              </div>
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
            <div className="dashboard__scrubber">
              <input
                type="range"
                min={0}
                max={lastIndex}
                value={index}
                style={{ '--p': `${progress}%` }}
                onChange={(e) => { setPlaying(false); setIndex(Number(e.target.value)) }}
                aria-label="Scrub through the simulated timeline"
              />
              <span>{index + 1} / {lastIndex + 1} readings</span>
            </div>
          </div>

          <div className="dashboard__card">
            <div className="dashboard__card-head">
              <h3>Vitals detail</h3>
              <span className="dashboard__card-sub">current reading · t = {current.time}</span>
            </div>
            <VitalsPanel point={current} prev={prev} />
          </div>
        </section>

        <aside className="dashboard__assistant">
          <AssistantPanel patient={patient} index={index} />
        </aside>
      </div>
    </div>
  )
}