"""Trend-based deterioration risk model.

This is a lightweight, interpretable stand-in for the LSTM/GRU described in the PRD (M1).
It reads a rolling window of vitals and combines two things per vital:
  * level  - how far the latest value is from normal, in the harmful direction
  * slope  - how fast it has been moving in the harmful direction across the window
and passes the weighted sum through a logistic function, then smooths with an EMA.

To swap in a trained sequence model later, keep the same interface:
    RiskModel.score_series(readings) -> list[int]   (0-100, one per reading)
"""
import math
from typing import Iterable

from .config import WINDOW

# name: (centre, scale, harmful direction, level weight, slope weight)
FEATURES = {
    "hr":   (80.0, 20.0, +1, 0.55, 0.60),
    "spo2": (97.0, 2.5, -1, 0.70, 0.80),
    "rr":   (16.0, 4.0, +1, 0.70, 0.75),
    "sbp":  (120.0, 18.0, -1, 0.45, 0.45),
    "temp": (37.0, 0.6, +1, 0.45, 0.35),
}
BIAS = -3.2
EMA_ALPHA = 0.4


def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def window_logit(window: list[dict]) -> float:
    first, last = window[0], window[-1]
    span = max(1, len(window) - 1)
    total = BIAS
    for key, (centre, scale, direction, w_level, w_slope) in FEATURES.items():
        level = max(0.0, direction * (last[key] - centre) / scale)
        slope = max(0.0, direction * (last[key] - first[key]) / scale)
        total += 0.75 * w_level * level + 0.75 * w_slope * slope * (span / 4.0)
    return total


class RiskModel:
    def score_series(self, readings: Iterable[dict]) -> list[int]:
        readings = list(readings)
        out: list[int] = []
        smooth = None
        for i in range(len(readings)):
            window = readings[max(0, i - WINDOW + 1): i + 1]
            raw = _sigmoid(window_logit(window)) * 100
            smooth = raw if smooth is None else EMA_ALPHA * raw + (1 - EMA_ALPHA) * smooth
            out.append(int(round(smooth)))
        return out


MODEL = RiskModel()
