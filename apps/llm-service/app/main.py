from fastapi import FastAPI

from app.api.upload import router as upload_router
from app.api.document import router as document_router
from app.api.process import router as process_router
from app.api.query import router as query_router
from app.config.settings import ensure_data_directories

ensure_data_directories()

app = FastAPI(title="RAG Backend", version="1.0")

app.include_router(upload_router)
app.include_router(document_router)
app.include_router(process_router)
app.include_router(query_router)

@app.get("/")
def health():
    return {
        "status": "running"
    }
