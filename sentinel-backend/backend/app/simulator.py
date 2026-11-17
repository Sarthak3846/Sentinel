"""Simulated, de-identified vitals streams (no PHI). Deterministic per patient (seeded),
so the server, the stream and the assistant always agree on the same numbers.

A latent "severity" curve drives the physiology; the risk score is NOT taken from that
curve - it is computed afterwards by the risk model from the vitals alone.
"""
import math
import random

from .model import MODEL
from .news2 import news2_score, news2_chart_value

LENGTH = 48

SCENARIOS = {
    "stable": dict(
        label="Stable",
        case_note="Post-op recovery, vitals within normal range throughout the window.",
        color="var(--risk-low)", seed=11,
        hr=(76, 2), spo2=(97, 0), rr=(15, 0), temp=(37.0, 0.1),
        severity=lambda t: 0.08 + math.sin(t * 6) * 0.02,
    ),
    "gradual": dict(
        label="Gradual decline",
        case_note="Early post-surgical sepsis pattern developing slowly over 12 hours.",
        color="var(--risk-mid)", seed=23,
        hr=(82, 26), spo2=(97, -8), rr=(16, 8), temp=(37.2, 1.1),
        severity=lambda t: 0.06 + t ** 1.6 * 0.72,
    ),
    "rapid": dict(
        label="Rapid decline",
        case_note="Acute respiratory decompensation with a fast-moving vitals trend.",
        color="var(--risk-high)", seed=37,
        hr=(88, 34), spo2=(95, -14), rr=(18, 14), temp=(37.4, 1.4),
        severity=lambda t: t * 0.3 if t < 0.5 else 0.15 + ((t - 0.5) * 2) ** 1.8 * 0.8,
    ),
}


def _build(sc: dict) -> list[dict]:
    rng = random.Random(sc["seed"])
    jit = lambda i, s: math.sin(i * s) * 0.5 + (rng.random() - 0.5) * 0.6
    points = []
    for i in range(LENGTH):
        t = i / (LENGTH - 1)
        sev = sc["severity"](t)
        hr = round(sc["hr"][0] + sc["hr"][1] * t + jit(i, 1.3) * 2)
        spo2 = int(min(100, max(78, round(sc["spo2"][0] + sc["spo2"][1] * t + jit(i, 0.9) * 0.6))))
        rr = round((sc["rr"][0] + sc["rr"][1] * t + jit(i, 1.7)) * 10) / 10
        temp = round((sc["temp"][0] + sc["temp"][1] * t + jit(i, 0.5) * 0.1) * 10) / 10
        sbp = round(118 - sev * 22 + jit(i, 0.7) * 3)
        score = news2_score(hr, spo2, rr, sbp, temp)
        points.append({
            "t": i,
            "time": f"{i // 4:02d}:{(i % 4) * 15:02d}",
            "hr": hr, "spo2": spo2, "rr": rr, "sbp": sbp, "temp": temp,
            "news2_score": score,
            "news2": news2_chart_value(score),
        })
    for p, r in zip(points, MODEL.score_series(points)):
        p["risk"] = r
    return points


_CACHE: dict[str, list[dict]] = {pid: _build(sc) for pid, sc in SCENARIOS.items()}


def patient_meta(pid: str) -> dict:
    sc = SCENARIOS[pid]
    return {"id": pid, "label": sc["label"], "caseNote": sc["case_note"],
            "color": sc["color"], "length": LENGTH}


def list_patients() -> list[dict]:
    return [patient_meta(pid) for pid in SCENARIOS]


def get_series(pid: str) -> list[dict]:
    return _CACHE[pid]
