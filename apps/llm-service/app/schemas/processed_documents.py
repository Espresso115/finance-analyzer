from pydantic import BaseModel
from typing import List


class Section(BaseModel):
    section_id: str
    heading: str
    content: str
    page_no: int


class ProcessedDocument(BaseModel):
    document_id: str
    filename: str
    title: str
    sections: List[Section]