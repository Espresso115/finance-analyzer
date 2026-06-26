import asyncio
import json
import os
import uuid
from typing import Any, List, Optional
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.api.upload import router as upload_router
from app.api.document import router as document_router
from app.api.process import router as process_router
from app.api.query import router as query_router
from app.config.settings import ensure_data_directories
from app.services.llm_service import LLMService
from app.services.llm.providers import get_llm_provider

load_dotenv(find_dotenv(), override=False)

ensure_data_directories()

app = FastAPI()

app.include_router(upload_router)
app.include_router(document_router)
app.include_router(process_router)
app.include_router(query_router)


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


class RagQueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = None
    document_ids: Optional[List[str]] = None
    generate_answer: bool = True
    conversation_id: Optional[str] = "default"


def _llm_model() -> str:
    from app.config.settings import settings
    provider = settings.llm_provider.lower()
    return settings.gemini_model if provider == "gemini" else settings.groq_model


def _rag_base_url() -> Optional[str]:
    value = os.getenv("RAG_SERVICE_URL", "").strip()
    return value.rstrip("/") if value else None


def _fallback_enabled() -> bool:
    return os.getenv("LLM_ALLOW_FALLBACK", "true").lower() in {"1", "true", "yes"}


def _read_json_response(response) -> dict[str, Any]:
    return json.loads(response.read().decode("utf-8"))


def _extract_http_error(error: HTTPError) -> str:
    try:
        payload = error.read().decode("utf-8")
    except OSError:
        payload = error.reason

    return payload or str(error)


def _require_rag_base_url() -> str:
    base_url = _rag_base_url()
    if not base_url:
        raise HTTPException(
            status_code=503,
            detail="RAG_SERVICE_URL is not configured for llm-service.",
        )

    return base_url


def _post_json(url: str, payload: dict[str, Any], timeout: float) -> dict[str, Any]:
    request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urlopen(request, timeout=timeout) as response:
        return _read_json_response(response)


def _post_multipart_file(
    url: str,
    *,
    filename: str,
    content_type: str,
    contents: bytes,
    timeout: float,
) -> dict[str, Any]:
    boundary = f"----llm-service-rag-{uuid.uuid4().hex}"
    body = b"".join(
        [
            f"--{boundary}\r\n".encode("utf-8"),
            (
                'Content-Disposition: form-data; name="file"; '
                f'filename="{filename}"\r\n'
            ).encode("utf-8"),
            f"Content-Type: {content_type or 'application/octet-stream'}\r\n\r\n".encode(
                "utf-8"
            ),
            contents,
            b"\r\n",
            f"--{boundary}--\r\n".encode("utf-8"),
        ]
    )
    request = Request(
        url,
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Content-Length": str(len(body)),
        },
        method="POST",
    )

    with urlopen(request, timeout=timeout) as response:
        return _read_json_response(response)


def _fallback_response(payload: GenerateRequest, error: Optional[str] = None) -> GenerateResponse:
    context_note = ""
    if payload.context:
        context_note = " I found local document context and summarized from that available evidence."

    return GenerateResponse(
        response=(
            "LLM generation is currently unavailable."
            f"{context_note} Check API key configurations."
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
        "model": _llm_model(),
        "ragServiceUrl": _rag_base_url()
    }


@app.post("/generate", response_model=GenerateResponse)
async def generate(payload: GenerateRequest):
    try:
        llm_service = LLMService(provider=get_llm_provider())
        context_str = "\n\n".join(payload.context) if payload.context else ""
        system_str = f"System:\n{payload.system}\n\n" if payload.system else ""
        full_context = system_str + context_str
        response = await llm_service.generate(question=payload.prompt, context=full_context)
        return GenerateResponse(
            response=response.text,
            model=response.model,
            provider=response.provider,
            fallback=False
        )
    except Exception as error:
        if not _fallback_enabled():
            raise
        return _fallback_response(payload, str(error))


@app.post("/generate/stream")
async def generate_stream(payload: GenerateRequest):
    try:
        llm_service = LLMService(provider=get_llm_provider())
        context_str = "\n\n".join(payload.context) if payload.context else ""
        system_str = f"System:\n{payload.system}\n\n" if payload.system else ""
        full_context = system_str + context_str

        async def stream_chunks():
            try:
                async for chunk in llm_service.stream(question=payload.prompt, context=full_context):
                    yield chunk
            except Exception as exc:
                yield f"\n\n[Generation error: {exc}]"

        return StreamingResponse(stream_chunks(), media_type="text/plain")
    except Exception as error:
        if not _fallback_enabled():
            raise HTTPException(status_code=500, detail=str(error))
        
        # Fallback text since it's a stream
        async def stream_fallback():
            yield _fallback_response(payload, str(error)).response
            
        return StreamingResponse(stream_fallback(), media_type="text/plain")
