import hashlib
import math
import re
from typing import Dict, List, Optional

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Financial AI RAG Service")


class EmbedRequest(BaseModel):
    texts: List[str]
    dimensions: int = 64


class RetrievalDocument(BaseModel):
    id: str
    text: str
    metadata: Dict[str, str] = {}


class RetrieveRequest(BaseModel):
    query: str
    documents: List[RetrievalDocument]
    limit: int = 5


def _tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def _embed(text: str, dimensions: int = 64) -> List[float]:
    vector = [0.0] * max(8, min(dimensions, 384))
    for token in _tokens(text):
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:2], "big") % len(vector)
        sign = 1 if digest[2] % 2 == 0 else -1
        vector[index] += sign

    norm = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [round(value / norm, 6) for value in vector]


def _cosine(left: List[float], right: List[float]) -> float:
    return sum(a * b for a, b in zip(left, right))


@app.get("/health")
def health():
    return {
        "service": "rag-service",
        "status": "running",
        "embeddingProvider": "deterministic-hash-fallback"
    }


@app.post("/embed")
def embed(request: EmbedRequest):
    return {
        "dimensions": max(8, min(request.dimensions, 384)),
        "embeddings": [_embed(text, request.dimensions) for text in request.texts]
    }


@app.post("/retrieve")
def retrieve(request: RetrieveRequest):
    query_embedding = _embed(request.query)
    query_terms = _tokens(request.query)
    ranked = []

    for document in request.documents:
        document_embedding = _embed(document.text)
        lexical_overlap = len(query_terms.intersection(_tokens(document.text)))
        score = _cosine(query_embedding, document_embedding) + lexical_overlap
        ranked.append({
            "id": document.id,
            "text": document.text,
            "metadata": document.metadata,
            "score": round(score, 6)
        })

    ranked.sort(key=lambda item: item["score"], reverse=True)
    return {
        "query": request.query,
        "results": ranked[: max(1, min(request.limit, 10))]
    }
