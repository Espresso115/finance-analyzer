from pydantic import BaseModel, Field
from typing import List, Dict


class EmbeddedChunk(BaseModel):
    chunk_id: str

    document_id: str
    section_id: str

    text: str

    embedding: List[float]

    chunk_index: int

    metadata: Dict = Field(default_factory=dict)
