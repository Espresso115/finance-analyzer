import asyncio
import json
import os
from typing import List, Optional
from urllib.error import URLError
from urllib.request import Request, urlopen

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI()


class GenerateRequest(BaseModel):
    prompt: str
    system: Optional[str] = None
    context: List[str] = []
    stream: bool = False
    model: Optional[str] = None


class GenerateResponse(BaseModel):
    response: str
    model: str
    provider: str
    fallback: bool = False
    error: Optional[str] = None


def _ollama_base_url() -> str:
    return os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")


def _llm_model() -> str:
    return os.getenv("LLM_MODEL", "qwen2.5:7b-instruct")


def _fallback_enabled() -> bool:
    return os.getenv("LLM_ALLOW_FALLBACK", "true").lower() in {"1", "true", "yes"}


def _build_prompt(payload: GenerateRequest) -> str:
    sections = []
    if payload.system:
        sections.append(f"System:\n{payload.system}")
    if payload.context:
        sections.append("Context:\n" + "\n\n".join(payload.context))
    sections.append(f"User question:\n{payload.prompt}")
    return "\n\n".join(sections)


def _ollama_generate(payload: GenerateRequest) -> str:
    request_body = json.dumps({
        "model": payload.model or _llm_model(),
        "prompt": _build_prompt(payload),
        "stream": False
    }).encode("utf-8")
    request = Request(
        f"{_ollama_base_url()}/api/generate",
        data=request_body,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urlopen(request, timeout=30) as response:
        data = json.loads(response.read().decode("utf-8"))
        return data.get("response", "").strip()


def _fallback_response(payload: GenerateRequest, error: Optional[str] = None) -> GenerateResponse:
    context_note = ""
    if payload.context:
        context_note = " I found local document context and summarized from that available evidence."

    return GenerateResponse(
        response=(
            "Local LLM generation is not available yet."
            f"{context_note} Configure Ollama to enable model-backed answers."
        ),
        model=payload.model or _llm_model(),
        provider="fallback",
        fallback=True,
        error=error
    )


@app.get("/health")
def health():
    return {
        "service": "llm-service",
        "status": "running",
        "ollamaBaseUrl": _ollama_base_url(),
        "model": _llm_model()
    }


@app.post("/generate", response_model=GenerateResponse)
async def generate(payload: GenerateRequest):
    try:
        response_text = await asyncio.to_thread(_ollama_generate, payload)
        return GenerateResponse(
            response=response_text,
            model=payload.model or _llm_model(),
            provider="ollama",
            fallback=False
        )
    except (URLError, TimeoutError, OSError, json.JSONDecodeError) as error:
        if not _fallback_enabled():
            raise
        return _fallback_response(payload, str(error))


@app.post("/generate/stream")
async def generate_stream(payload: GenerateRequest):
    result = await generate(payload)

    async def stream_chunks():
      for word in result.response.split():
          yield f"{word} "
          await asyncio.sleep(0)

    return StreamingResponse(stream_chunks(), media_type="text/plain")
