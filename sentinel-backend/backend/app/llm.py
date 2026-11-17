"""Grounded explanation layer.

The LLM never predicts. It only narrates the vitals window the server already holds.
Three safeguards keep it honest:
  1. The prompt contains ONLY the window data and forbids outside knowledge.
  2. Every number in the reply is checked against the numbers in the window.
  3. If the key is missing, the call fails, or validation fails, a deterministic
     rule-based explanation (built purely from the same window) is returned instead.
"""
import re
import httpx

from . import config

KEYS = [("hr", "heart rate", "bpm"), ("spo2", "SpO2", "%"), ("rr", "respiratory rate", "/min"),
        ("sbp", "systolic BP", "mmHg"), ("temp", "temperature", "C")]

SYSTEM_PROMPT = (
    "You are the explanation assistant inside Sentinel, a research prototype that shows a "
    "deterioration risk score for SIMULATED patients. You do not diagnose or give treatment advice. "
    "Answer ONLY from the data block provided. Quote only numbers that appear in the data block. "
    "If the question cannot be answered from the data, say so in one sentence. "
    "Be concise: at most 90 words, plain language, no markdown, no bullet lists."
)


def get_window(series: list[dict], index: int) -> list[dict]:
    index = max(0, min(index, len(series) - 1))
    return series[max(0, index - config.WINDOW + 1): index + 1]


def _fmt(v):
    return f"{v:g}" if isinstance(v, float) else str(v)


def build_context(label: str, window: list[dict]) -> tuple[str, set[float]]:
    """Return (data block text, set of numbers the reply is allowed to mention)."""
    first, last = window[0], window[-1]
    allowed: set[float] = {float(len(window))}
    lines = [f"Case: {label}. Window: last {len(window)} readings (15 min apart), oldest first."]
    for p in window:
        lines.append(
            f"t={p['time']}  HR {p['hr']}  SpO2 {p['spo2']}  RR {_fmt(p['rr'])}  "
            f"SBP {p['sbp']}  Temp {_fmt(p['temp'])}  risk {p['risk']}  NEWS2-baseline {p['news2_score']}"
        )
        for k in ("hr", "spo2", "rr", "sbp", "temp", "risk", "news2_score"):
            allowed.add(float(p[k]))
        for k in ("hr", "spo2", "rr", "sbp", "temp"):
            pass
    lines.append("Changes first -> last reading:")
    for key, name, unit in KEYS:
        d = round(last[key] - first[key], 1)
        pct = round(100 * d / first[key], 1) if first[key] else 0.0
        allowed.update({abs(d), abs(pct), abs(round(pct))})
        lines.append(f"{name}: {_fmt(d)} {unit} ({_fmt(pct)}%)")
    rd = last["risk"] - first["risk"]
    allowed.add(float(abs(rd)))
    lines.append(f"risk score change: {rd} points; current risk {last['risk']}/100; "
                 f"current NEWS2 raw score {last['news2_score']}")
    return "\n".join(lines), allowed


_NUM = re.compile(r"\d+(?:\.\d+)?")


def numbers_are_grounded(text: str, allowed: set[float]) -> bool:
    for m in _NUM.findall(text):
        v = float(m)
        if v in allowed or v in (0, 1, 100):   # 0/1 and the "/100" score scale are harmless
            continue
        if any(abs(v - a) <= 0.051 for a in allowed):
            continue
        return False
    return True


def rule_based_explanation(window: list[dict]) -> str:
    """Deterministic explanation; port of the original frontend explainWindow()."""
    if len(window) < 2:
        return "Not enough vitals history yet to characterize a trend. Keep streaming to build a window."
    first, last = window[0], window[-1]
    hr, sp, rr = last["hr"] - first["hr"], last["spo2"] - first["spo2"], last["rr"] - first["rr"]
    rd = last["risk"] - first["risk"]
    clauses = []
    if abs(hr) >= 4:
        clauses.append(f"heart rate has {'risen' if hr > 0 else 'fallen'} {abs(hr)} bpm")
    if abs(sp) >= 1:
        clauses.append(f"SpO2 has {'improved' if sp > 0 else 'dropped'} {abs(sp)} points")
    if abs(rr) >= 1.5:
        clauses.append(f"respiratory rate has {'increased' if rr > 0 else 'decreased'} {abs(rr):.1f} breaths/min")
    trend = (f"Over the last {len(window)} readings, {', '.join(clauses)}." if clauses else
             f"Over the last {len(window)} readings, all tracked vitals have stayed within a narrow band.")
    if rd >= 12:
        verdict = (f"The risk score has climbed {rd} points in this window, consistent with the combined "
                   "vitals trend above - a trend-based signal, not a single threshold breach.")
    elif rd <= -8:
        verdict = f"The risk score has eased {abs(rd)} points, tracking the stabilizing trend above."
    else:
        verdict = f"The risk score has stayed roughly flat (within {abs(rd)} points), matching a steady vitals trend."
    return f"{trend} {verdict} Current score: {last['risk']}/100, based only on the vitals window shown on this screen."


async def explain(label: str, window: list[dict], question: str) -> dict:
    fallback = {"answer": rule_based_explanation(window), "source": "rule-based"}
    if not config.GROQ_API_KEY or len(window) < 2:
        return fallback
    context, allowed = build_context(label, window)
    payload = {
        "model": config.GROQ_MODEL,
        "temperature": 0.2,
        "max_tokens": 220,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"DATA\n{context}\n\nQUESTION\n{question}"},
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            r = await client.post(config.GROQ_URL, json=payload,
                                  headers={"Authorization": f"Bearer {config.GROQ_API_KEY}"})
            r.raise_for_status()
            text = r.json()["choices"][0]["message"]["content"].strip()
    except Exception:
        return {**fallback, "source": "rule-based (LLM unavailable)"}
    if not text or not numbers_are_grounded(text, allowed):
        return {**fallback, "source": "rule-based (LLM reply failed grounding check)"}
    return {"answer": text, "source": f"groq:{config.GROQ_MODEL}"}
