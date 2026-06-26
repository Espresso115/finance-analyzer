from fastapi import APIRouter

from app.utils.document_utils import list_documents as load_documents


router = APIRouter()


@router.get("/documents")
def list_documents():
    return load_documents()
