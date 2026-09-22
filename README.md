<<<<<<< HEAD
# Sentinel — Frontend

Frontend-only React app for **Sentinel**, a predictive patient deterioration
monitoring concept: a landing page, a research/about page, and a live demo
dashboard with a simulated streaming risk chart and a grounded AI explanation
assistant.

This is UI only — no backend, model, or LLM API calls are wired in. The
dashboard replays locally-generated, simulated vitals data (see
`src/data/patients.js`) to demonstrate the intended product flow described in
the PRD. No real patient data or PHI is used anywhere in this project.

## Folder structure

```
sentinel/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx              # React entry point, router setup
    ├── App.jsx                # Route definitions + shared layout
    ├── styles/
    │   └── tokens.css         # Design tokens (color, type, spacing) + base styles
    ├── data/
    │   └── patients.js        # Simulated patient vitals/risk series + grounded "explain" logic
    ├── components/
    │   ├── Navbar.jsx / .css
    │   ├── Footer.jsx / .css
    │   ├── HeroVisual.jsx / .css      # Landing hero risk/alarm illustration
    │   ├── PatientSelector.jsx / .css # Dashboard sidebar case picker
    │   ├── RiskChart.jsx / .css       # Live risk score chart (recharts)
    │   ├── VitalsPanel.jsx / .css     # HR / SpO2 / RR / BP / Temp cards
    │   └── AssistantPanel.jsx / .css  # Grounded chat assistant panel
    └── pages/
        ├── Landing.jsx / .css   # Marketing/landing page ("/")
        ├── Dashboard.jsx / .css # Live demo dashboard ("/demo")
        └── About.jsx / .css     # Research / methodology page ("/about")
```

## Running it

```bash
npm install
npm run dev
```

Then open the printed local URL. Routes:

- `/` — landing page
- `/demo` — live dashboard demo (patient selector, streaming risk chart, assistant)
- `/about` — research/methodology page

## Notes

- Charting uses `recharts`; routing uses `react-router-dom`.
- Fonts are loaded from Google Fonts in `index.html` (IBM Plex Sans / IBM Plex Mono).
- All vitals/risk data is synthetically generated client-side for demo purposes —
  swap `src/data/patients.js` for real API calls once the backend (FastAPI + model +
  LLM layer, per the PRD) exists.
=======
# Sentinel
>>>>>>> b95b75146b1a4fcf67ad41f4f009603d290eeb65
