from pydantic import BaseModel, Field
from typing import Any


class QueryRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    top_k: int | None = Field(default=None, ge=1, le=12)
    document_ids: list[str] | None = Field(default=None, max_length=50)
    generate_answer: bool = True
    conversation_id: str | None = Field(default="default", max_length=80)


class RetrievedSource(BaseModel):
    source_id: int
    score: float
    document_id: str
    chunk_id: str
    section_id: str
    heading: str | None = None
    page_no: int | None = None
    filename: str | None = None
    text: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class QueryResponse(BaseModel):
    question: str
    answer: str
    provider: str
    sources: list[RetrievedSource]
    prompt: str | None = None
    conversation_id: str | None = None
    cached: bool = False
