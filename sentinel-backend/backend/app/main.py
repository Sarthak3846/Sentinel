import asyncio
import json

from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from . import config, llm, simulator

app = FastAPI(title="Sentinel API", version="1.0.0",
              description="Research/portfolio prototype - simulated data only, not a diagnostic tool.")

app.add_middleware(CORSMiddleware, allow_origins=config.CORS_ORIGINS,
                   allow_methods=["*"], allow_headers=["*"])


def _series(pid: str) -> list[dict]:
    try:
        return simulator.get_series(pid)
    except KeyError:
        raise HTTPException(404, f"Unknown patient '{pid}'")


@app.get("/api/health")
def health():
    return {"status": "ok", "llm_enabled": bool(config.GROQ_API_KEY),
            "llm_model": config.GROQ_MODEL if config.GROQ_API_KEY else None,
            "disclaimer": "Simulated data only. Not a clinically validated tool."}


@app.get("/api/patients")
def patients():
    return simulator.list_patients()


@app.get("/api/patients/{pid}/readings")
def readings(pid: str, start: int = Query(0, ge=0), end: Optional[int] = Query(None, ge=0)):
    s = _series(pid)
    return {"patient": simulator.patient_meta(pid), "readings": s[start:end]}


@app.get("/api/patients/{pid}/stream")
async def stream(pid: str, request: Request, start: int = Query(0, ge=0),
                 interval_ms: int = Query(650, ge=100, le=5000)):
    """Server-Sent Events: one scored reading every `interval_ms`, then a `done` event."""
    s = _series(pid)

    async def gen():
        for p in s[start:]:
            if await request.is_disconnected():
                return
            yield f"data: {json.dumps(p)}\n\n"
            await asyncio.sleep(interval_ms / 1000)
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


class ChatRequest(BaseModel):
    patient_id: str
    index: int = Field(ge=0)
    question: str = Field(min_length=1, max_length=500)


@app.post("/api/chat")
async def chat(req: ChatRequest):
    s = _series(req.patient_id)
    window = llm.get_window(s, req.index)          # the server's own data, never client-supplied values
    result = await llm.explain(simulator.patient_meta(req.patient_id)["label"], window, req.question.strip())
    return {**result, "window": {"from": window[0]["time"], "to": window[-1]["time"], "readings": len(window)}}
