import base64
import re
from typing import Dict, List, Optional

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Financial AI Parser Service")


class ParseRequest(BaseModel):
    filename: str
    mime_type: str
    content_base64: str


class ChunkRequest(BaseModel):
    text: str
    chunk_size: int = 900
    overlap: int = 150
    metadata: Optional[Dict[str, str]] = None


class Chunk(BaseModel):
    index: int
    text: str
    metadata: Dict[str, str] = {}


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.replace("\x00", " ")).strip()


def _decode_payload(content_base64: str) -> bytes:
    return base64.b64decode(content_base64.encode("utf-8"), validate=True)


def _parse_text(payload: bytes) -> str:
    return payload.decode("utf-8", errors="replace")


@app.get("/health")
def health():
    return {
        "service": "parser-service",
        "status": "running",
        "supportedTypes": [
            "text/plain",
            "text/markdown",
            "text/csv",
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]
    }


@app.post("/parse")
def parse_document(request: ParseRequest):
    payload = _decode_payload(request.content_base64)
    parser = "text"
    status = "completed"
    error = ""

    if request.mime_type in {"text/plain", "text/markdown", "text/csv"}:
        extracted_text = _parse_text(payload)
    elif request.mime_type == "application/pdf":
        parser = "pdf-unavailable"
        extracted_text = ""
        status = "pending"
        error = "Install pypdf in parser-service to extract PDF text."
    elif request.mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        parser = "docx-unavailable"
        extracted_text = ""
        status = "pending"
        error = "Install python-docx in parser-service to extract DOCX text."
    else:
        parser = "unsupported"
        extracted_text = ""
        status = "error"
        error = "Unsupported document type."

    normalized = _normalize_text(extracted_text)

    return {
        "status": status,
        "filename": request.filename,
        "parser": parser,
        "text": normalized,
        "textPreview": normalized[:500],
        "wordCount": len(normalized.split()) if normalized else 0,
        "error": error
    }


@app.post("/chunk", response_model=List[Chunk])
def chunk_text(request: ChunkRequest):
    text = _normalize_text(request.text)
    if not text:
        return []

    chunk_size = max(200, min(request.chunk_size, 4000))
    overlap = max(0, min(request.overlap, chunk_size // 2))
    chunks: List[Chunk] = []
    start = 0
    index = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(Chunk(
            index=index,
            text=text[start:end],
            metadata={**(request.metadata or {}), "chunkIndex": str(index)}
        ))
        if end == len(text):
            break
        start = end - overlap
        index += 1

    return chunks
