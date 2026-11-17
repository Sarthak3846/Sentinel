import { useEffect, useRef, useState } from 'react'
import { askAssistant } from '../api.js'
import './AssistantPanel.css'
import './AssistantPanelExtras.css'

const SUGGESTIONS = [
  'Why is the score rising?',
  'Is this trend or a single bad reading?',
  'What should I watch next?',
]

export default function AssistantPanel({ patient, index }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)
  const requestId = useRef(0)

  useEffect(() => {
    requestId.current += 1 // ignore any in-flight answer for the previous case
    setTyping(false)
    setMessages([
      {
        role: 'assistant',
        text: `Tracking ${patient.label.toLowerCase()} case. Ask why the risk score is moving \u2014 I'll answer from the vitals window currently on screen.`,
      },
    ])
  }, [patient.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, typing])

  async function send(text) {
    const question = text.trim()
    if (!question || typing) return
    setMessages((m) => [...m, { role: 'user', text: question }])
    setInput('')
    setTyping(true)
    const id = ++requestId.current
    try {
      const res = await askAssistant(patient.id, index, question)
      if (id !== requestId.current) return
      setMessages((m) => [...m, { role: 'assistant', text: res.answer, source: res.source, win: res.window }])
    } catch {
      if (id !== requestId.current) return
      setMessages((m) => [...m, { role: 'assistant', error: true, text: 'I could not reach the Sentinel API. Check that the backend is running and try again.' }])
    } finally {
      if (id === requestId.current) setTyping(false)
    }
  }

  return (
    <div className="assistant-panel">
      <div className="assistant-panel__head">
        <span className="assistant-panel__avatar" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 5.5V11C4 16.2 7.4 20.9 12 22C16.6 20.9 20 16.2 20 11V5.5L12 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M8 12.5L10.3 14.8L15.5 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="assistant-panel__title">
          <h4>Explanation assistant</h4>
          <span>Grounded in the visible vitals window only</span>
        </div>
        <span className="assistant-panel__dot" title="Online" />
      </div>

      <div className="assistant-panel__messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`assistant-msg assistant-msg--${m.role} ${m.error ? 'assistant-msg--error' : ''}`}>
            {m.text}
            {m.source && (
              <span className="assistant-msg__source">
                {m.source}{m.win ? ` · ${m.win.from}\u2013${m.win.to}` : ''}
              </span>
            )}
          </div>
        ))}
        {typing && (
          <div className="assistant-msg assistant-msg--assistant assistant-msg--typing" aria-label="Assistant is typing">
            <i /><i /><i />
          </div>
        )}
      </div>

      <div className="assistant-panel__suggestions">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)} disabled={typing}>{s}</button>
        ))}
      </div>

      <form className="assistant-panel__form" onSubmit={(e) => { e.preventDefault(); send(input) }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this patient's vitals..."
          aria-label="Ask the assistant a question"
          maxLength={500}
        />
        <button type="submit" aria-label="Send" disabled={typing}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 19V5M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  )
}
