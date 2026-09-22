import { useEffect, useRef, useState } from 'react'
import { explainWindow } from '../data/patients.js'
import './AssistantPanel.css'

const SUGGESTIONS = [
  'Why is the score rising?',
  'Is this trend or a single bad reading?',
  'What should I watch next?',
]

export default function AssistantPanel({ patient, index }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        text: `Tracking ${patient.label.toLowerCase()} case. Ask why the risk score is moving \u2014 I'll answer from the vitals window currently on screen.`,
      },
    ])
  }, [patient.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function send(text) {
    const question = text.trim()
    if (!question) return
    setMessages((m) => [...m, { role: 'user', text: question }])
    setInput('')
    window.setTimeout(() => {
      const answer = explainWindow(patient, index)
      setMessages((m) => [...m, { role: 'assistant', text: answer }])
    }, 380)
  }

  return (
    <div className="assistant-panel">
      <div className="assistant-panel__head">
        <span className="assistant-panel__dot" />
        <div>
          <h4>Explanation assistant</h4>
          <span>Grounded in the visible vitals window only</span>
        </div>
      </div>

      <div className="assistant-panel__messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`assistant-msg assistant-msg--${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="assistant-panel__suggestions">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)}>{s}</button>
        ))}
      </div>

      <form
        className="assistant-panel__form"
        onSubmit={(e) => { e.preventDefault(); send(input) }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this patient's vitals..."
          aria-label="Ask the assistant a question"
        />
        <button type="submit" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  )
}
