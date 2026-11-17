# Sentinel backend integration

Unzip this archive INTO the root of your `sentinel/` project (it adds `backend/` and overwrites the
listed frontend files). Then:

## 1. Start the backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate      macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env   (optional: add GROQ_API_KEY)
uvicorn app.main:app --reload --port 8000
```
Check http://localhost:8000/api/health and the interactive docs at http://localhost:8000/docs

## 2. Start the frontend (second terminal, project root)
```bash
npm install        # nothing new is required
npm run dev
```
Open http://localhost:5173/demo. Vite proxies `/api` to port 8000 (see `vite.config.js`).

## 3. Optional: real LLM explanations
Create a free key at https://console.groq.com/keys and put it in `backend/.env` as `GROQ_API_KEY=...`.
Without a key the assistant uses the deterministic rule-based explainer (the UI shows which one answered).

## Tests
```bash
cd backend && python -m pytest -q
```

## Files
New:      backend/** , src/api.js, src/pages/DashboardStatus.css, src/components/AssistantPanelExtras.css
Modified: vite.config.js, src/pages/Dashboard.jsx, src/components/PatientSelector.jsx, src/components/AssistantPanel.jsx
Now unused (safe to delete): src/data/patients.js
