from pydantic import BaseModel, Field
from typing import Dict

class Chunk(BaseModel):
    chunk_id: str
    document_id: str
    section_id: str

    text: str

    chunk_index: int

    start_char: int
    end_char: int

    metadata: Dict = Field(default_factory=dict)
