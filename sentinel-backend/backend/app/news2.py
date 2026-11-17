"""NEWS2 early-warning score (Royal College of Physicians, 2017), SpO2 scale 1.

Consciousness is assumed "Alert" and oxygen "room air" for the simulated cases,
so only the five physiological parameters contribute.
"""


def _rr(v):
    if v <= 8: return 3
    if v <= 11: return 1
    if v <= 20: return 0
    if v <= 24: return 2
    return 3


def _spo2(v):
    if v <= 91: return 3
    if v <= 93: return 2
    if v <= 95: return 1
    return 0


def _sbp(v):
    if v <= 90: return 3
    if v <= 100: return 2
    if v <= 110: return 1
    if v <= 219: return 0
    return 3


def _hr(v):
    if v <= 40: return 3
    if v <= 50: return 1
    if v <= 90: return 0
    if v <= 110: return 1
    if v <= 130: return 2
    return 3


def _temp(v):
    if v <= 35.0: return 3
    if v <= 36.0: return 1
    if v <= 38.0: return 0
    if v <= 39.0: return 1
    return 2


def news2_score(hr, spo2, rr, sbp, temp) -> int:
    return _rr(rr) + _spo2(spo2) + _sbp(sbp) + _hr(hr) + _temp(temp)


def news2_chart_value(score: int) -> int:
    """Map the raw 0-20 score onto the dashboard's 0-100 axis (score 7 = 'high' -> 70)."""
    return min(100, score * 10)
