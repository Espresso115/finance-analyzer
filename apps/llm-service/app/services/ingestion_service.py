from app.config.settings import settings
from app.schemas.processed_documents import ProcessedDocument
from app.services.chunking_service import Chunker
from app.services.docling_service import parse_pdf, save_processed_document
from app.services.document_parser import parse_docling_output
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore, get_vector_store
from app.utils.document_utils import get_document, set_document_status
from app.utils.json_store import write_json


class IngestionService:
    def __init__(
        self,
        chunker: Chunker | None = None,
        embedder: EmbeddingService | None = None,
        vector_store: VectorStore | None = None,
    ):
        self.chunker = chunker or Chunker(
            chunk_size=settings.chunk_size,
            overlap=settings.chunk_overlap,
        )
        self.embedder = embedder or EmbeddingService()
        self.vector_store = vector_store or get_vector_store()

    def process_document(self, document_id: str) -> dict | None:
        doc = get_document(document_id)
        if not doc:
            return None

        set_document_status(document_id, "processing")

        result = parse_pdf(doc["file_path"])
        raw_path = save_processed_document(document_id, result.document)
        raw_docling = result.document.export_to_dict()

        processed_document = parse_docling_output(
            document_id=document_id,
            filename=doc["filename"],
            docling_json=raw_docling,
        )
        normalized_path = self.save_normalized_document(processed_document)

        chunks = self.chunker.chunk_document(processed_document)
        for chunk in chunks:
            chunk.metadata["filename"] = doc["filename"]

        embedded_chunks = self.embedder.embed_document(chunks)

        indexed_count = self.vector_store.replace_document(
            document_id=document_id,
            chunks=embedded_chunks,
        )

        updated_doc = set_document_status(
            document_id,
            "indexed",
            processed_file=raw_path,
            normalized_file=str(normalized_path),
            chunk_count=len(chunks),
            indexed_chunk_count=indexed_count,
        )

        return {
            "status": "indexed",
            "document": updated_doc,
            "processed_file": raw_path,
            "normalized_file": str(normalized_path),
            "chunk_count": len(chunks),
            "indexed_chunk_count": indexed_count,
        }

    def save_normalized_document(self, document: ProcessedDocument):
        path = settings.processed_dir / f"{document.document_id}_normalized.json"
        write_json(path, document.model_dump())
        return path
