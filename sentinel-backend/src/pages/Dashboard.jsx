import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPatients, fetchReadings, openStream } from '../api.js'
import PatientSelector from '../components/PatientSelector.jsx'
import RiskChart from '../components/RiskChart.jsx'
import VitalsPanel from '../components/VitalsPanel.jsx'
import AssistantPanel from '../components/AssistantPanel.jsx'
import './Dashboard.css'
import './DashboardStatus.css'

const START_INDEX = 6

export default function Dashboard() {
  const [patients, setPatients] = useState([])
  const [patientId, setPatientId] = useState('gradual')
  const [readings, setReadings] = useState([])
  const [index, setIndex] = useState(START_INDEX)
  const [playing, setPlaying] = useState(false)
  const [showBaseline, setShowBaseline] = useState(true)
  const [status, setStatus] = useState('loading') // loading | ready | offline
  const [streamError, setStreamError] = useState(false)
  const readingsRef = useRef([])

  useEffect(() => { readingsRef.current = readings }, [readings])

  // 1) patient list
  const loadPatients = useCallback(() => {
    setStatus('loading')
    fetchPatients()
      .then((list) => {
        setPatients(list)
        setPatientId((id) => (list.some((p) => p.id === id) ? id : list[0]?.id))
        setStatus('ready')
      })
      .catch(() => setStatus('offline'))
  }, [])
  useEffect(() => { loadPatients() }, [loadPatients])

  const patient = patients.find((p) => p.id === patientId)

  // 2) first slice of readings whenever the selected case changes
  useEffect(() => {
    if (!patient) return
    let cancelled = false
    setPlaying(false)
    setStreamError(false)
    fetchReadings(patient.id, 0, START_INDEX + 1)
      .then((res) => {
        if (cancelled) return
        setReadings(res.readings)
        setIndex(START_INDEX)
        setPlaying(true)
      })
      .catch(() => !cancelled && setStatus('offline'))
    return () => { cancelled = true }
  }, [patient?.id])

  // 3) live stream while playing
  useEffect(() => {
    if (!playing || !patient) return
    const conn = openStream(patient.id, readingsRef.current.length, {
      onReading: (r) => {
        setReadings((prev) => {
          if (prev.length !== r.t) return prev
          return [...prev, r]
        })
        setIndex(r.t)
      },
      onDone: () => setPlaying(false),
      onError: () => { setPlaying(false); setStreamError(true) },
    })
    return () => conn.close()
  }, [playing, patient?.id])

  if (status === 'loading') {
    return <div className="dashboard"><div className="container dashboard__grid"><div className="dashboard__state"><h2>Connecting to Sentinel API…</h2></div></div></div>
  }
  if (status === 'offline' || !patient || readings.length === 0) {
    return (
      <div className="dashboard">
        <div className="container dashboard__grid">
          <div className="dashboard__state">
            <h2>{status === 'offline' ? 'Backend not reachable' : 'Loading readings…'}</h2>
            {status === 'offline' && (
              <>
                <p>Start the API with <code>uvicorn app.main:app --reload</code> from the <code>backend/</code> folder, then retry.</p>
                <button className="btn btn--primary" onClick={loadPatients}>Retry</button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  const lastIndex = patient.length - 1
  const safeIndex = Math.min(index, readings.length - 1)
  const visibleData = readings.slice(0, safeIndex + 1)
  const current = readings[safeIndex]
  const prev = readings[Math.max(safeIndex - 1, 0)]
  const atEnd = readings.length > lastIndex && safeIndex >= lastIndex

  const riskLevel = current.risk >= 60 ? 'high' : current.risk >= 30 ? 'mid' : 'low'
  const riskLabelMap = { low: 'Low risk', mid: 'Watch', high: 'Elevated risk' }
  const progress = lastIndex > 0 ? (safeIndex / lastIndex) * 100 : 0
  const diff = current.risk - prev.risk

  function togglePlay() {
    setStreamError(false)
    if (playing) { setPlaying(false); return }
    if (atEnd) {
      setReadings((r) => r.slice(0, START_INDEX + 1))
      readingsRef.current = readingsRef.current.slice(0, START_INDEX + 1)
      setIndex(START_INDEX)
    } else {
      setIndex(readings.length - 1)
    }
    setPlaying(true)
  }

  return (
    <div className="dashboard">
      <div className="dashboard__disclaimer">
        <span className="dashboard__disclaimer-dot" />
        Research / portfolio prototype &middot; simulated data only &middot; not a diagnostic or clinically validated tool
      </div>

      <div className="container dashboard__grid">
        <aside className="dashboard__sidebar">
          <PatientSelector patients={patients} activeId={patientId} onSelect={setPatientId} />
        </aside>

        <section className="dashboard__main">
          {streamError && (
            <div className="dashboard__banner">Lost connection to the stream. Press Resume to reconnect.</div>
          )}
          <div className="dashboard__toolbar">
            <div>
              <h1>{patient.label} case</h1>
              <p>{patient.caseNote}</p>
            </div>
            <div className="dashboard__controls">
              <label className="dashboard__toggle">
                <input type="checkbox" checked={showBaseline} onChange={(e) => setShowBaseline(e.target.checked)} />
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
              <span className="risk-summary__pill"><i /> {riskLabelMap[riskLevel]}</span>
              <span className="risk-summary__score">{current.risk}<span>/100</span></span>
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
                max={Math.max(readings.length - 1, 1)}
                value={safeIndex}
                style={{ '--p': `${progress}%` }}
                onChange={(e) => { setPlaying(false); setIndex(Number(e.target.value)) }}
                aria-label="Scrub through the streamed timeline"
              />
              <span>{safeIndex + 1} / {patient.length} readings</span>
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
          <AssistantPanel patient={patient} index={safeIndex} />
        </aside>
      </div>
    </div>
  )
}
