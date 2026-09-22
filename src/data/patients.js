// Simulated, de-identified vitals streams for demo purposes only.
// No real patient data (PHI) is used anywhere in this project.

function buildSeries({ length, hrBase, hrDrift, spo2Base, spo2Drift, rrBase, rrDrift, tempBase, tempDrift, riskCurve }) {
  const points = []
  for (let i = 0; i < length; i++) {
    const t = i / (length - 1)
    const jitter = (seed) => (Math.sin(i * seed) * 0.5 + (Math.random() - 0.5) * 0.6)

    const hr = Math.round(hrBase + hrDrift * t + jitter(1.3) * 2)
    const spo2 = Math.min(100, Math.max(78, Math.round(spo2Base + spo2Drift * t + jitter(0.9) * 0.6)))
    const rr = Math.round((rrBase + rrDrift * t + jitter(1.7) * 1) * 10) / 10
    const temp = Math.round((tempBase + tempDrift * t + jitter(0.5) * 0.1) * 10) / 10
    const sbp = Math.round(118 - (riskCurve(t) * 22) + jitter(0.7) * 3)

    points.push({
      t: i,
      time: `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`,
      hr,
      spo2,
      rr,
      temp,
      sbp,
      risk: Math.round(riskCurve(t) * 100),
      news2: Math.round(Math.max(0, riskCurve(t) * 100 - 18 - (1 - t) * 20)),
    })
  }
  return points
}

export const PATIENTS = [
  {
    id: 'stable',
    label: 'Stable',
    caseNote: 'Post-op recovery, vitals within normal range throughout the window.',
    color: 'var(--risk-low)',
    series: buildSeries({
      length: 48,
      hrBase: 76, hrDrift: 2,
      spo2Base: 97, spo2Drift: 0,
      rrBase: 15, rrDrift: 0,
      tempBase: 37.0, tempDrift: 0.1,
      riskCurve: (t) => 0.08 + Math.sin(t * 6) * 0.02,
    }),
  },
  {
    id: 'gradual',
    label: 'Gradual decline',
    caseNote: 'Early post-surgical sepsis pattern developing slowly over 12 hours.',
    color: 'var(--risk-mid)',
    series: buildSeries({
      length: 48,
      hrBase: 82, hrDrift: 26,
      spo2Base: 97, spo2Drift: -8,
      rrBase: 16, rrDrift: 8,
      tempBase: 37.2, tempDrift: 1.1,
      riskCurve: (t) => 0.06 + Math.pow(t, 1.6) * 0.72,
    }),
  },
  {
    id: 'rapid',
    label: 'Rapid decline',
    caseNote: 'Acute respiratory decompensation with a fast-moving vitals trend.',
    color: 'var(--risk-high)',
    series: buildSeries({
      length: 48,
      hrBase: 88, hrDrift: 34,
      spo2Base: 95, spo2Drift: -14,
      rrBase: 18, rrDrift: 14,
      tempBase: 37.4, tempDrift: 1.4,
      riskCurve: (t) => (t < 0.5 ? t * 0.3 : 0.15 + Math.pow((t - 0.5) * 2, 1.8) * 0.8),
    }),
  },
]

export function getPatient(id) {
  return PATIENTS.find((p) => p.id === id) || PATIENTS[0]
}

// Very small grounded "explanation" generator — mirrors the PRD's requirement
// that the assistant only reasons over the vitals actually visible on screen.
export function explainWindow(patient, upToIndex) {
  const window = patient.series.slice(Math.max(0, upToIndex - 7), upToIndex + 1)
  if (window.length < 2) {
    return "Not enough vitals history yet to characterize a trend. Keep streaming to build a window."
  }
  const first = window[0]
  const last = window[window.length - 1]
  const hrDelta = last.hr - first.hr
  const spo2Delta = last.spo2 - first.spo2
  const rrDelta = last.rr - first.rr
  const riskDelta = last.risk - first.risk

  const clauses = []
  if (Math.abs(hrDelta) >= 4) {
    clauses.push(`heart rate has ${hrDelta > 0 ? 'risen' : 'fallen'} ${Math.abs(hrDelta)} bpm`)
  }
  if (Math.abs(spo2Delta) >= 1) {
    clauses.push(`SpO2 has ${spo2Delta > 0 ? 'improved' : 'dropped'} ${Math.abs(spo2Delta)} points`)
  }
  if (Math.abs(rrDelta) >= 1.5) {
    clauses.push(`respiratory rate has ${rrDelta > 0 ? 'increased' : 'decreased'} ${Math.abs(rrDelta).toFixed(1)} breaths/min`)
  }

  const trendText = clauses.length
    ? `Over the last ${window.length} readings, ${clauses.join(', ')}.`
    : `Over the last ${window.length} readings, all tracked vitals have stayed within a narrow band.`

  let verdict
  if (riskDelta >= 12) {
    verdict = `The risk score has climbed ${riskDelta} points in this window, which is consistent with the combined vitals trend above — this is a trend-based signal, not any single threshold breach.`
  } else if (riskDelta <= -8) {
    verdict = `The risk score has eased ${Math.abs(riskDelta)} points, tracking the stabilizing trend above.`
  } else {
    verdict = `The risk score has stayed roughly flat (±${Math.abs(riskDelta)} points), matching a steady vitals trend.`
  }

  return `${trendText} ${verdict} Current score: ${last.risk}/100, based only on the vitals window shown on this screen.`
}
