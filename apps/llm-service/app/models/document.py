from pydantic import BaseModel


class DocumentMetadata(BaseModel):
    document_id: str
    filename: str
    file_path: str
    size_bytes: int