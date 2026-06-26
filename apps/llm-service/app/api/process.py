from fastapi import APIRouter
from fastapi import HTTPException

from app.services.ingestion_service import IngestionService
from app.services.vector_store import get_vector_store


router = APIRouter()


@router.post("/process/{document_id}")
def process_document(document_id: str):

    result = IngestionService().process_document(document_id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return result


@router.get("/index/stats")
def index_stats():
    return get_vector_store().stats()
