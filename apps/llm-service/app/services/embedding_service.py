from sentence_transformers import SentenceTransformer

from app.config.settings import settings
from app.schemas.chunk import Chunk
from app.schemas.embeddings import EmbeddedChunk


class EmbeddingService:

    def __init__(
        self,
        model_name: str | None = None,
        device: str | None = None,
        batch_size: int | None = None,
        local_files_only: bool | None = None
    ):
        self.model_name = model_name or settings.embedding_model
        self.device = device or settings.embedding_device
        self.batch_size = batch_size or settings.embedding_batch_size
        self.local_files_only = (
            settings.embedding_local_files_only
            if local_files_only is None
            else local_files_only
        )

        self.model = SentenceTransformer(
            self.model_name,
            device=self.device,
            local_files_only=self.local_files_only
        )

    def embed_query(self, query: str) -> list[float]:
        vector = self.model.encode(
            [query],
            normalize_embeddings=True,
            batch_size=1
        )[0]

        return vector.tolist()

    def embed_document(
        self,
        chunks: list[Chunk]
    ) -> list[EmbeddedChunk]:
        if not chunks:
            return []

        texts = [self.embedding_text(chunk) for chunk in chunks]

        vectors = self.model.encode(
            texts,
            normalize_embeddings=True,
            batch_size=self.batch_size,
            show_progress_bar=False
        )

        embedded_chunks = []

        for chunk, vector in zip(
            chunks,
            vectors
        ):

            embedded_chunk = EmbeddedChunk(
                chunk_id=chunk.chunk_id,

                document_id=chunk.document_id,
                section_id=chunk.section_id,

                text=chunk.text,

                embedding=vector.tolist(),

                chunk_index=chunk.chunk_index,

                metadata=chunk.metadata
            )

            embedded_chunks.append(
                embedded_chunk
            )

        return embedded_chunks

    def embedding_text(self, chunk: Chunk) -> str:
        metadata = chunk.metadata or {}
        parts = []

        if metadata.get("filename"):
            parts.append(f"Document: {metadata['filename']}")
        if metadata.get("heading_path") or metadata.get("heading"):
            parts.append(
                f"Section: {metadata.get('heading_path') or metadata.get('heading')}"
            )
        if metadata.get("section_code"):
            parts.append(f"SEC section: {metadata['section_code']}")
        if metadata.get("page_no"):
            parts.append(f"Page: {metadata['page_no']}")

        parts.append(f"Text: {chunk.text}")
        return "\n".join(parts)
