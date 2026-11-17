// Thin client for the Sentinel FastAPI backend (proxied through Vite at /api).
const BASE = import.meta.env.VITE_API_URL || ''

async function json(res) {
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

export const fetchPatients = () => fetch(`${BASE}/api/patients`).then(json)

export const fetchReadings = (id, start = 0, end) =>
  fetch(`${BASE}/api/patients/${id}/readings?start=${start}${end != null ? `&end=${end}` : ''}`).then(json)

export const fetchHealth = () => fetch(`${BASE}/api/health`).then(json)

export function askAssistant(patientId, index, question) {
  return fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id: patientId, index, question }),
  }).then(json)
}

// Opens the live SSE stream. Returns an object with close().
export function openStream(id, start, { onReading, onDone, onError }) {
  const es = new EventSource(`${BASE}/api/patients/${id}/stream?start=${start}`)
  let finished = false
  es.onmessage = (e) => onReading(JSON.parse(e.data))
  es.addEventListener('done', () => { finished = true; es.close(); onDone() })
  es.onerror = () => { es.close(); if (!finished) onError() }
  return { close: () => es.close() }
}
