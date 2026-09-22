# Sentinel

### Predictive Patient Deterioration Monitoring with a Per-Patient AI Assistant

> **Research / Portfolio Prototype — Not a Diagnostic or Clinically Validated System**

Sentinel is a clinical decision-support prototype that combines **deep learning on patient vital-sign time series** with a **grounded LLM explanation layer**.

The central idea is to move patient monitoring from purely **threshold-based alarms** toward **trend-based deterioration risk prediction**: instead of waiting for a single vital sign to cross a hard threshold, Sentinel analyzes the trajectory of multiple vitals and produces a continuously updating risk score. An AI assistant then explains the observed risk in plain language using the current patient-vitals context.

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [The Sentinel Approach](#the-sentinel-approach)
- [System Architecture](#system-architecture)
- [Core Components](#core-components)
- [Data](#data)
- [Demo Flow](#demo-flow)
- [MVP Features](#mvp-features)
- [Model Evaluation](#model-evaluation)
- [LLM Grounding](#llm-grounding)
- [Technology Stack](#technology-stack)
- [Project Roadmap](#project-roadmap)
- [Success Criteria](#success-criteria)
- [Limitations and Safety](#limitations-and-safety)
- [Project Structure](#project-structure)
- [Future Work](#future-work)
- [Research Direction](#research-direction)
- [License](#license)

---

## Overview

Hospital monitoring systems commonly rely on fixed thresholds to trigger alerts. While useful, this approach can miss deterioration that emerges gradually across several physiological signals.

Sentinel explores a different workflow:

```text
Patient Vitals
      │
      ▼
Time-Series Window
      │
      ▼
Sequence Prediction Model
      │
      ▼
Deterioration Risk Score
      │
      ├──────────────► Live Risk Chart
      │
      ▼
Current Vitals + Risk Context
      │
      ▼
Grounded LLM Explanation
      │
      ▼
Human-Readable Reasoning
```

The system is designed as a **research and portfolio demonstration**, using simulated/replayed patient data rather than live hospital integration.

---

## The Problem

### 1. Threshold-based monitoring

A conventional alarm may trigger when a vital sign crosses a predefined threshold.

For example:

```text
SpO₂ < 90%
      │
      ▼
    Alarm
```

The limitation is that deterioration does not always appear as one dramatic value.

A patient may instead exhibit a combination of smaller changes:

```text
Respiratory Rate   ↑
SpO₂               ↓
Heart Rate         ↑
Blood Pressure     ↓
Temperature        ↗
        │
        ▼
Changing physiological trajectory
        │
        ▼
Increasing deterioration risk
```

Sentinel is designed to model this **trajectory** rather than treating every observation independently.

### 2. Alarm fatigue

Large numbers of low-value or false alerts can contribute to alarm fatigue, potentially making genuinely important alerts harder to notice.

### 3. Late detection

A patient's deterioration may become visible in the combined trend of multiple measurements before any individual measurement reaches a hard alarm threshold.

Sentinel therefore investigates whether a sequence model can identify an increasing risk trajectory earlier than a simple threshold-based approach.

---

# The Sentinel Approach

Sentinel consists of two primary intelligence layers.

## Layer 1 — Deep Learning Prediction Engine

A sequence model processes a rolling window of patient observations.

Potential model architectures include:

- LSTM
- GRU
- Lightweight Temporal Fusion Transformer

The model receives time-series information such as:

- Heart rate
- Blood pressure
- SpO₂
- Respiratory rate
- Temperature
- Relevant laboratory values

and produces a continuously updating **deterioration risk score**.

Conceptually:

```text
                 ┌─────────────────┐
Heart Rate ─────►│                 │
Blood Pressure ─►│                 │
SpO₂ ───────────►│  Sequence Model │───► Risk Score
Resp. Rate ─────►│   LSTM / GRU    │
Temperature ────►│                 │
Labs ───────────►│                 │
                 └─────────────────┘
```

The important distinction is that the model receives a **sequence of observations**, allowing it to learn temporal patterns rather than relying only on a single measurement.

---

## Layer 2 — Grounded LLM Explanation

The LLM is **not responsible for making the prediction**.

Its role is to translate the model output and observed vital-sign trends into an understandable explanation.

For example:

```text
Risk score increased

Why?

• Respiratory rate has increased over the recent observation window.
• SpO₂ is trending downward.
• The combined trajectory contributed to the increasing risk score.
```

The explanation layer is explicitly designed to remain grounded in the available vitals context rather than generating an unrestricted medical narrative.

This separation is intentional:

```text
Prediction Model
      │
      │ predicts
      ▼
Risk Score
      │
      │ + current vitals context
      ▼
Grounded LLM
      │
      │ explains
      ▼
Human-readable rationale
```

---

# System Architecture

The planned MVP architecture consists of five major layers:

| Layer | Role |
|---|---|
| **Frontend** | Interactive dashboard, patient selection, live charts and assistant UI |
| **Backend API** | Serves simulated/replayed vitals and prediction results |
| **Prediction Model** | Produces the deterioration risk score |
| **LLM Explanation Layer** | Explains score behavior using the current vitals context |
| **Data Layer** | Stores/prepares MIMIC-derived data for offline training and replay |

### High-Level Architecture

```text
                         ┌─────────────────────┐
                         │       User          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  React Dashboard    │
                         │                     │
                         │ • Patient Selector  │
                         │ • Risk Chart        │
                         │ • Vitals View       │
                         │ • AI Assistant      │
                         └──────────┬──────────┘
                                    │
                              HTTP / API
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     FastAPI         │
                         │                     │
                         │ • Replay Vitals     │
                         │ • Serve Predictions │
                         │ • Assistant Context │
                         └──────┬────────┬─────┘
                                │        │
                   ┌────────────┘        └─────────────┐
                   ▼                                    ▼
        ┌───────────────────┐                ┌──────────────────┐
        │ Prediction Model  │                │  Grounded LLM    │
        │                   │                │                  │
        │ LSTM / GRU / TFT  │                │ Explanation only │
        └─────────┬─────────┘                └────────┬─────────┘
                  │                                   │
                  └──────────────┬────────────────────┘
                                 ▼
                       ┌─────────────────────┐
                       │  Risk + Explanation│
                       └─────────────────────┘
```

---

# Core Components

## 1. Live Risk Dashboard

The dashboard displays:

- Simulated patient vitals
- Continuously updating deterioration risk
- A time-series risk chart
- Current patient context

The primary visual objective is to make the relationship between **changing vitals** and **changing risk** immediately understandable.

---

## 2. Patient Case Selector

The MVP is designed around a small collection of pre-built simulated scenarios.

Example scenarios:

```text
Stable
   │
   └──► Risk remains relatively stable


Gradual deterioration
   │
   └──► Risk increases progressively


Rapid decline
   │
   └──► Risk rises sharply
```

This allows the system to demonstrate how a temporal model behaves under different trajectories.

---

## 3. Vitals Detail View

The dashboard can expose the individual measurements contributing to the model input:

- HR
- SpO₂
- RR
- BP
- Temperature

This is important because the risk score should remain connected to observable physiological data.

---

## 4. AI Assistant

The assistant provides a per-patient chat interface.

Example questions:

```text
Why is the risk score increasing?

Which vital signs are contributing most?

Why did the risk score decrease?

What changed over the last few observations?
```

The assistant should answer using the current vitals window and model context rather than inventing unsupported clinical information.

---

## 5. Model Comparison

An optional comparison panel can show the Sentinel model alongside baseline approaches.

Potential baselines include:

- NEWS2
- XGBoost
- LightGBM

The purpose is not simply to demonstrate a more complex model, but to investigate whether the temporal model provides additional predictive value.

---

# Data

The project concept is designed around **MIMIC-III / MIMIC-IV**, credentialed, de-identified ICU datasets containing physiological measurements and other clinical information.

The proposed pipeline is:

```text
MIMIC Data
    │
    ▼
Data Selection
    │
    ▼
Cleaning / Preprocessing
    │
    ▼
Time-Series Construction
    │
    ▼
Feature / Label Preparation
    │
    ▼
Sequence Model Training
    │
    ▼
Validation + Baseline Comparison
    │
    ▼
Demo Replay
```

For the website MVP, historical data is replayed as a **simulated real-time stream** rather than connecting to a live hospital system.

> **Data access note:** MIMIC access requires the appropriate credentialing/training process. The public-facing MVP should use only data that is permitted for the intended use.

---

# Demo Flow

The intended user experience is:

### Step 1 — Landing Page

The user sees a concise explanation of:

- The monitoring problem
- Threshold-based alarm limitations
- Sentinel's trend-based approach

### Step 2 — Open Dashboard

The user enters the interactive demonstration.

### Step 3 — Select Patient Case

A simulated patient scenario is selected.

### Step 4 — Stream Vitals

Patient measurements appear progressively over simulated time.

### Step 5 — Observe Risk

The deterioration risk score updates as the physiological trajectory changes.

### Step 6 — Ask the Assistant

The user can ask why the risk score is changing.

### Step 7 — Receive Grounded Explanation

The assistant explains the score using the visible/current vitals context.

---

# MVP Features

| Feature | Priority | Purpose |
|---|:---:|---|
| Landing page | P0 | Explain the problem and Sentinel concept |
| Live risk dashboard | P0 | Display simulated vitals and updating risk |
| Patient case selector | P0 | Demonstrate multiple patient trajectories |
| AI assistant | P0 | Explain why risk is changing |
| Vitals detail view | P1 | Expose individual model inputs |
| Model comparison | P1 | Compare against baseline approaches |
| About / Research page | P2 | Explain dataset, methodology and research |

---

# Model Evaluation

The prediction model should be evaluated against meaningful baselines rather than only demonstrating that it produces a changing score.

Potential comparison setup:

```text
                    Same patient data
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          Sentinel       XGBoost        NEWS2
          Sequence       Baseline       Clinical
           Model                         Score
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                    Evaluation
```

The project concept proposes benchmarking the sequence model against:

- Gradient-boosted models such as XGBoost/LightGBM
- NEWS2 as a clinically established early-warning score

The exact prediction target, evaluation metrics, preprocessing strategy and experimental protocol should be documented once the research implementation is finalized.

---

# LLM Grounding

A key design principle is that the LLM should **explain**, not independently diagnose or predict.

### Intended context

```text
Current Vitals Window
        +
Model Risk Score
        +
Relevant Trend Information
        │
        ▼
   LLM Context
        │
        ▼
Grounded Explanation
```

### Desired behavior

The assistant should:

- Reference values actually present in the supplied context
- Describe observable trends
- Relate those trends to the risk score
- Avoid inventing measurements
- Avoid claiming unsupported diagnoses
- Avoid presenting itself as a clinical authority

### Example

```text
Observed:
SpO₂ → decreasing
Respiratory rate → increasing
Risk score → increasing

Explanation:
"The risk score is increasing alongside a downward SpO₂
trend and an upward respiratory-rate trend in the current
observation window."
```

The exact explanation format may evolve during implementation and evaluation.

---

# Technology Stack

The MVP architecture proposes the following stack:

### Frontend

- React
- Live charting component
- Interactive dashboard UI

### Backend

- FastAPI
- REST API
- Simulated/replayed vitals stream
- Prediction inference endpoint

### Machine Learning

- Python
- PyTorch or equivalent deep-learning framework
- LSTM / GRU / lightweight Temporal Fusion Transformer
- XGBoost / LightGBM for baseline comparison

### Data

- MIMIC-III / MIMIC-IV
- Preprocessed time-series data
- Simulated historical replay for the demo

### LLM Layer

- Groq or another low-latency inference provider
- Grounded prompt using the current vitals window and risk score

> The exact implementation stack may change as development progresses. This README describes the project architecture and MVP direction rather than claiming that every listed component is already implemented.

---

# Project Roadmap

## M1 — Model

- Prepare a MIMIC subset
- Define a single prediction target
- Train and validate the sequence model
- Benchmark against a baseline

## M2 — Backend

- Build FastAPI service
- Replay historical/simulated vitals
- Serve prediction results

## M3 — Frontend v1

- Build landing page
- Build live dashboard
- Add risk chart
- Connect to backend

## M4 — Assistant

- Integrate LLM explanation layer
- Pass current vitals context
- Constrain responses to supplied context
- Evaluate explanation grounding

## M5 — Polish

- Patient case selector
- Vitals detail view
- Model comparison
- About / research page
- Final UI and demo refinement

---

# Success Criteria

The MVP is designed around three practical goals.

### 1. Understandability

A first-time viewer should understand the core idea within approximately **60 seconds** without requiring narration.

### 2. Visible temporal advantage

At least one simulated case should demonstrate a situation where the learned risk trajectory changes before a naive single-vital threshold alarm would trigger.

### 3. Grounded explanations

Manual evaluation of assistant conversations should show that explanations remain consistent with the visible/current vitals and do not introduce unsupported values.

---

# Limitations and Safety

## Not a diagnostic system

Sentinel is a **research and portfolio prototype**, not a certified medical device.

It should not be used to:

- Diagnose a patient
- Make autonomous clinical decisions
- Replace a clinician
- Provide treatment recommendations
- Serve as a hospital monitoring system

The project has not been presented as clinically validated or regulatory-approved.

## No live hospital integration

The MVP is explicitly designed around simulated/replayed data rather than direct hospital-system integration.

## Data limitations

MIMIC data is credentialed and de-identified. Dataset access, preprocessing and permitted use must follow the applicable dataset requirements.

## LLM hallucination risk

An LLM can produce plausible but unsupported statements. Sentinel therefore treats grounding as a core engineering and evaluation requirement rather than assuming that an LLM explanation is automatically reliable.

## Clinical validation

Predictive performance demonstrated on a research dataset does not establish clinical effectiveness. Any future clinical use would require substantially broader validation and appropriate regulatory and institutional processes.

---

# Project Structure

A suggested repository structure is:

```text
sentinel/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── models/
│   ├── services/
│   └── requirements.txt
│
├── ml/
│   ├── data/
│   ├── preprocessing/
│   ├── training/
│   ├── evaluation/
│   └── inference/
│
├── data/
│   └── README.md
│
├── notebooks/
│
├── research/
│
├── tests/
│
├── .env.example
├── .gitignore
└── README.md
```

This structure is a suggested organization for the project; the actual repository structure should reflect the implementation.

---

# Future Work

Potential extensions include:

- More robust temporal modeling
- Additional physiological and laboratory features
- Better calibration of risk scores
- More comprehensive baseline comparisons
- Explainability evaluation
- Automated grounding checks for LLM responses
- More patient trajectories and edge cases
- Uncertainty estimation
- Robustness testing
- Prospective or external validation
- Integration with appropriate clinical workflows in a future research setting

---

# Research Direction

Sentinel can be viewed as two related research problems:

### 1. Temporal deterioration prediction

> Can a sequence model identify deterioration risk from the trajectory of multiple patient variables before simple threshold-based alarms become informative?

### 2. Grounded model explanation

> Can an LLM translate a model's risk signal and the underlying physiological trends into useful explanations without introducing unsupported medical information?

This makes the project more than a conventional ML dashboard: the prediction model, baseline comparison, explanation layer and grounding behavior can all be independently evaluated.

---

# Disclaimer

**Sentinel is a research/portfolio prototype. It is not a medical device, diagnostic system, or substitute for professional clinical judgment. It has not been clinically validated or regulatory-approved.**

All demonstrations should use simulated or appropriately de-identified/authorized data.

---

# License

Add the project's chosen license here before publishing the repository.

For example:

```text
MIT License
```

if the project is ultimately released under MIT.
