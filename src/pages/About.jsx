import './About.css'

const milestones = [
  { id: 'M1', title: 'Model', body: 'Train and validate the sequence model on a MIMIC subset; benchmark against baseline.' },
  { id: 'M2', title: 'Backend', body: 'Build a FastAPI service to replay simulated vitals streams and serve risk scores.' },
  { id: 'M3', title: 'Frontend v1', body: 'Landing page and live dashboard with the risk chart, before the assistant is wired in.' },
  { id: 'M4', title: 'Assistant', body: 'Integrate the LLM explanation layer, grounded in the current vitals window.' },
  { id: 'M5', title: 'Polish', body: 'Patient case selector, vitals detail view, and this research page.' },
]

const architecture = [
  { layer: 'Frontend', detail: 'React, with a live-updating chart component. This repository.' },
  { layer: 'Backend API', detail: 'FastAPI serving simulated / replayed vitals streams and prediction results.' },
  { layer: 'Prediction model', detail: 'LSTM/GRU or a lightweight Temporal Fusion Transformer, trained offline on a MIMIC-derived subset.' },
  { layer: 'Explanation layer', detail: 'A low-latency LLM API, prompted with the current vitals window and risk score, constrained to grounded explanation only.' },
  { layer: 'Data', detail: 'Pre-processed MIMIC-III/IV subset, replayed as a simulated real-time stream for the demo.' },
]

export default function About() {
  return (
    <div className="about container">
      <header className="about__header">
        <span className="about__eyebrow">About this prototype</span>
        <h1>A research concept, presented honestly</h1>
        <p>
          Sentinel demonstrates trend-based deterioration risk prediction and a grounded
          LLM explanation layer. It is scoped as a portfolio / research demonstration \u2014
          not a certified clinical device, and not validated for diagnostic use.
        </p>
      </header>

      <section className="about__block">
        <h2>The problem it responds to</h2>
        <p>
          Most hospital monitoring is threshold-based: an alarm fires only once a vital
          sign crosses a fixed line. That causes alarm fatigue from hundreds of low-value
          alerts per shift, and late detection, since deterioration is usually visible in
          the trend of multiple vitals hours before any single value crosses a threshold.
        </p>
      </section>

      <section className="about__block">
        <h2>System architecture</h2>
        <div className="arch-table">
          {architecture.map((row) => (
            <div className="arch-table__row" key={row.layer}>
              <span className="arch-table__layer">{row.layer}</span>
              <span className="arch-table__detail">{row.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="about__block">
        <h2>Dataset</h2>
        <p>
          MIMIC-III / MIMIC-IV is the standard, freely available (credentialed access) ICU
          dataset of de-identified vitals, lab results, and clinical notes. A reasonable
          target label is ICU readmission within 48\u201372 hours, or a continuous
          deterioration risk score benchmarked against NEWS2.
        </p>
      </section>

      <section className="about__block">
        <h2>Milestones</h2>
        <div className="milestones">
          {milestones.map((m) => (
            <div className="milestones__item" key={m.id}>
              <span className="milestones__id">{m.id}</span>
              <div>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about__block about__caveats">
        <h2>Risks &amp; caveats</h2>
        <ul>
          <li>The site is explicit everywhere that this is a research/portfolio prototype, not a diagnostic or clinically validated tool.</li>
          <li>MIMIC access requires credentialing (CITI training), budgeted into the project timeline before model work begins.</li>
          <li>The LLM layer is constrained to the retrieved vitals context, to avoid generating plausible-sounding but incorrect medical explanations.</li>
        </ul>
      </section>
    </div>
  )
}
