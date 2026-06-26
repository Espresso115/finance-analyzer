import logging
from typing import Iterable, Protocol

import numpy as np

from app.config.settings import ensure_data_directories, settings
from app.schemas.embeddings import EmbeddedChunk
from app.utils.json_store import read_json, write_json


logger = logging.getLogger(__name__)


class VectorStore(Protocol):
    def replace_document(
        self,
        document_id: str,
        chunks: Iterable[EmbeddedChunk],
    ) -> int:
        ...

    def search(
        self,
        query_embedding: list[float],
        top_k: int = 6,
        document_ids: list[str] | None = None,
    ) -> list[dict]:
        ...

    def stats(self) -> dict:
        ...

    def all_chunks(self, document_ids: list[str] | None = None) -> list[dict]:
        ...

    def neighbor_chunks(
        self,
        document_id: str,
        section_id: str,
        chunk_index: int,
        window: int = 2,
    ) -> list[dict]:
        ...


class ChromaVectorStore:
    def __init__(
        self,
        persist_path=None,
        collection_name: str | None = None,
    ):
        ensure_data_directories()
        import chromadb

        self.persist_path = persist_path or settings.chroma_dir
        self.collection_name = collection_name or settings.chroma_collection
        self.client = chromadb.PersistentClient(path=str(self.persist_path))
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    def replace_document(
        self,
        document_id: str,
        chunks: Iterable[EmbeddedChunk],
    ) -> int:
        self.collection.delete(where={"document_id": document_id})
        incoming = [chunk.model_dump() for chunk in chunks]

        if not incoming:
            return 0

        self.collection.upsert(
            ids=[chunk["chunk_id"] for chunk in incoming],
            embeddings=[chunk["embedding"] for chunk in incoming],
            documents=[chunk["text"] for chunk in incoming],
            metadatas=[self._metadata(chunk) for chunk in incoming],
        )

        return len(incoming)

    def search(
        self,
        query_embedding: list[float],
        top_k: int = 6,
        document_ids: list[str] | None = None,
    ) -> list[dict]:
        where = None
        if document_ids:
            where = {"document_id": {"$in": document_ids}}

        result = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=max(top_k, 1),
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        ids = result.get("ids", [[]])[0]
        docs = result.get("documents", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]
        distances = result.get("distances", [[]])[0]

        matches = []
        for chunk_id, text, metadata, distance in zip(ids, docs, metadatas, distances):
            if not chunk_id or not text or not metadata:
                continue
            score = 1.0 - float(distance)
            metadata = metadata or {}
            if not metadata.get("document_id") or not metadata.get("section_id"):
                continue
            matches.append(
                {
                    "score": score,
                    "chunk": {
                        "chunk_id": chunk_id,
                        "document_id": metadata.get("document_id"),
                        "section_id": metadata.get("section_id"),
                        "text": text,
                        "chunk_index": metadata.get("chunk_index", 0),
                        "metadata": metadata,
                    },
                }
            )

        return matches

    def all_chunks(self, document_ids: list[str] | None = None) -> list[dict]:
        where = None
        if document_ids:
            where = {"document_id": {"$in": document_ids}}

        result = self.collection.get(
            where=where,
            include=["documents", "metadatas"],
        )
        return self._get_result_to_chunks(result)

    def neighbor_chunks(
        self,
        document_id: str,
        section_id: str,
        chunk_index: int,
        window: int = 2,
    ) -> list[dict]:
        chunks = self.all_chunks([document_id])
        return [
            chunk
            for chunk in chunks
            if chunk["section_id"] == section_id
            and abs(int(chunk["chunk_index"]) - int(chunk_index)) <= window
        ]

    def stats(self) -> dict:
        return {
            "backend": "chroma",
            "chunk_count": self.collection.count(),
            "collection": self.collection_name,
            "store_path": str(self.persist_path),
        }

    def _metadata(self, chunk: dict) -> dict:
        metadata = dict(chunk.get("metadata") or {})
        metadata.update(
            {
                "chunk_id": chunk["chunk_id"],
                "document_id": chunk["document_id"],
                "section_id": chunk["section_id"],
                "chunk_index": chunk["chunk_index"],
            }
        )
        return {
            key: value
            for key, value in metadata.items()
            if isinstance(value, (str, int, float, bool))
        }

    def _get_result_to_chunks(self, result: dict) -> list[dict]:
        chunks = []
        for chunk_id, text, metadata in zip(
            result.get("ids", []),
            result.get("documents", []),
            result.get("metadatas", []),
        ):
            if not chunk_id or not text or not metadata:
                continue
            metadata = metadata or {}
            if not metadata.get("document_id") or not metadata.get("section_id"):
                continue
            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "document_id": metadata.get("document_id"),
                    "section_id": metadata.get("section_id"),
                    "text": text,
                    "chunk_index": metadata.get("chunk_index", 0),
                    "metadata": metadata,
                }
            )
        return chunks


class LocalVectorStore:
    def __init__(self, store_path=None):
        ensure_data_directories()
        self.store_path = store_path or settings.vector_chunks_file

    def all_chunks(self, document_ids: list[str] | None = None) -> list[dict]:
        chunks = read_json(self.store_path, [])
        if not document_ids:
            return chunks

        allowed_ids = set(document_ids)
        return [
            chunk
            for chunk in chunks
            if chunk["document_id"] in allowed_ids
        ]

    def _all_chunks_unfiltered(self) -> list[dict]:
        return read_json(self.store_path, [])

    def upsert(self, chunks: Iterable[EmbeddedChunk]) -> int:
        existing = self._all_chunks_unfiltered()
        incoming = [chunk.model_dump() for chunk in chunks]
        incoming_ids = {chunk["chunk_id"] for chunk in incoming}

        retained = [
            chunk
            for chunk in existing
            if chunk["chunk_id"] not in incoming_ids
        ]

        write_json(self.store_path, retained + incoming)
        return len(incoming)

    def replace_document(
        self,
        document_id: str,
        chunks: Iterable[EmbeddedChunk],
    ) -> int:
        existing = [
            chunk
            for chunk in self._all_chunks_unfiltered()
            if chunk["document_id"] != document_id
        ]
        incoming = [chunk.model_dump() for chunk in chunks]
        write_json(self.store_path, existing + incoming)
        return len(incoming)

    def delete_document(self, document_id: str) -> int:
        existing = self._all_chunks_unfiltered()
        retained = [
            chunk
            for chunk in existing
            if chunk["document_id"] != document_id
        ]
        write_json(self.store_path, retained)
        return len(existing) - len(retained)

    def search(
        self,
        query_embedding: list[float],
        top_k: int = 6,
        document_ids: list[str] | None = None,
    ) -> list[dict]:
        candidates = self.all_chunks()

        if document_ids:
            allowed_ids = set(document_ids)
            candidates = [
                chunk
                for chunk in candidates
                if chunk["document_id"] in allowed_ids
            ]

        if not candidates:
            return []

        matrix = np.asarray(
            [chunk["embedding"] for chunk in candidates],
            dtype=np.float32,
        )
        query = np.asarray(query_embedding, dtype=np.float32)

        query_norm = np.linalg.norm(query)
        if query_norm:
            query = query / query_norm

        scores = matrix @ query
        limit = min(max(top_k, 1), len(candidates))
        ranked_indices = np.argsort(scores)[-limit:][::-1]

        results = []
        for index in ranked_indices:
            chunk = candidates[int(index)]
            results.append(
                {
                    "score": float(scores[int(index)]),
                    "chunk": chunk,
                }
            )

        return results

    def stats(self) -> dict:
        chunks = self._all_chunks_unfiltered()
        document_ids = {chunk["document_id"] for chunk in chunks}
        return {
            "backend": "local_json",
            "chunk_count": len(chunks),
            "document_count": len(document_ids),
            "store_path": str(self.store_path),
        }

    def neighbor_chunks(
        self,
        document_id: str,
        section_id: str,
        chunk_index: int,
        window: int = 2,
    ) -> list[dict]:
        return [
            chunk
            for chunk in self.all_chunks([document_id])
            if chunk["section_id"] == section_id
            and abs(int(chunk["chunk_index"]) - int(chunk_index)) <= window
        ]


def get_vector_store() -> VectorStore:
    if settings.vector_backend == "local_json":
        return LocalVectorStore()

    try:
        return ChromaVectorStore()
    except Exception:
        logger.exception("Chroma vector store unavailable; falling back to local JSON")
        return LocalVectorStore()
