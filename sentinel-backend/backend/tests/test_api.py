import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app import llm, simulator

client = TestClient(app)


def test_patients_and_readings():
    assert [p["id"] for p in client.get("/api/patients").json()] == ["stable", "gradual", "rapid"]
    r = client.get("/api/patients/gradual/readings?end=7").json()
    assert len(r["readings"]) == 7 and {"risk", "news2", "hr", "time"} <= r["readings"][0].keys()
    assert client.get("/api/patients/nope/readings").status_code == 404


def test_risk_leads_news2_on_gradual_case():
    s = simulator.get_series("gradual")
    first_risk = next(p["t"] for p in s if p["risk"] >= 30)
    first_news = next(p["t"] for p in s if p["news2"] >= 30)
    assert first_risk < first_news
    assert max(p["risk"] for p in simulator.get_series("stable")) < 15


def test_stream_sse():
    with client.stream("GET", "/api/patients/stable/stream?start=44&interval_ms=100") as r:
        body = "".join(r.iter_text())
    assert body.count("data: {\"t\"") == 4 and "event: done" in body


def test_chat_fallback_and_grounding():
    r = client.post("/api/chat", json={"patient_id": "rapid", "index": 30, "question": "Why is it rising?"}).json()
    assert r["source"].startswith("rule-based") and "Current score" in r["answer"]
    w = llm.get_window(simulator.get_series("rapid"), 30)
    _, allowed = llm.build_context("Rapid", w)
    assert llm.numbers_are_grounded(f"SpO2 is {w[-1]['spo2']} and risk is {w[-1]['risk']}", allowed)
    assert not llm.numbers_are_grounded("SpO2 is 42 and HR is 211", allowed)


def test_chat_validation():
    assert client.post("/api/chat", json={"patient_id": "rapid", "index": 3, "question": ""}).status_code == 422


def _fake_client(text):
    class R:
        def raise_for_status(self): pass
        def json(self): return {"choices": [{"message": {"content": text}}]}
    class C:
        def __init__(self, *a, **k): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *a): pass
        async def post(self, *a, **k): return R()
    return C


def test_llm_path_accepts_grounded_and_rejects_hallucinated(monkeypatch):
    monkeypatch.setattr(llm.config, "GROQ_API_KEY", "test")
    w = llm.get_window(simulator.get_series("rapid"), 30)
    good = f"Risk is {w[-1]['risk']} and SpO2 is {w[-1]['spo2']}."
    monkeypatch.setattr(llm.httpx, "AsyncClient", _fake_client(good))
    assert asyncio.run(llm.explain("Rapid", w, "why?"))["source"].startswith("groq")
    monkeypatch.setattr(llm.httpx, "AsyncClient", _fake_client("Heart rate is 213 bpm."))
    assert "grounding" in asyncio.run(llm.explain("Rapid", w, "why?"))["source"]
