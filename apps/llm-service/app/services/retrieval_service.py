from app.config.settings import settings
from app.schemas.query import RetrievedSource
from app.services.embedding_service import EmbeddingService
from app.services.hybrid_retrieval_service import HybridRetrievalService
from app.services.vector_store import VectorStore, get_vector_store


class RetrievalService:
    def __init__(
        self,
        embedder: EmbeddingService | None = None,
        vector_store: VectorStore | None = None,
        hybrid_service: HybridRetrievalService | None = None,
    ):
        self.embedder = embedder or EmbeddingService()
        self.vector_store = vector_store or get_vector_store()
        self.hybrid_service = hybrid_service or HybridRetrievalService()

    def retrieve(
        self,
        question: str,
        top_k: int | None = None,
        document_ids: list[str] | None = None,
    ) -> list[RetrievedSource]:
        limit = min(top_k or settings.retrieval_top_k, settings.max_retrieval_top_k)
        candidate_limit = max(
            limit * settings.retrieval_candidate_multiplier,
            limit + settings.neighbor_window * 2,
        )
        expanded_query = self.hybrid_service.expand_query(question)
        query_embedding = self.embedder.embed_query(expanded_query)

        vector_results = self.vector_store.search(
            query_embedding=query_embedding,
            top_k=candidate_limit,
            document_ids=document_ids,
        )
        vector_results = self._valid_results(vector_results)
        all_chunks = [
            chunk
            for chunk in self.vector_store.all_chunks(document_ids)
            if self._is_valid_chunk(chunk)
        ]
        bm25_results = self.hybrid_service.bm25_search(
            question,
            all_chunks,
            candidate_limit,
        )
        fused_results = self.hybrid_service.reciprocal_rank_fusion(
            [vector_results, bm25_results],
            candidate_limit,
        )
        expanded_results = self._expand_neighbors(fused_results)
        reranked_results = self.hybrid_service.rerank_financial_results(
            question,
            expanded_results,
        )
        results = self.hybrid_service.dedupe_results(reranked_results, limit)

        sources = []
        for result in results:
            chunk = result["chunk"]
            if not self._is_valid_chunk(chunk):
                continue

            metadata = chunk.get("metadata", {})

            sources.append(
                RetrievedSource(
                    source_id=len(sources) + 1,
                    score=result["score"],
                    document_id=chunk["document_id"],
                    chunk_id=chunk["chunk_id"],
                    section_id=chunk["section_id"],
                    heading=metadata.get("heading"),
                    page_no=metadata.get("page_no"),
                    filename=metadata.get("filename"),
                    text=chunk["text"],
                    metadata=metadata,
                )
            )

        return sources

    def _expand_neighbors(self, results: list[dict]) -> list[dict]:
        expanded = []
        seen_ids = set()

        for result in results:
            chunk = result["chunk"]
            if not self._is_valid_chunk(chunk):
                continue

            chunk_id = chunk["chunk_id"]
            if chunk_id not in seen_ids:
                expanded.append(result)
                seen_ids.add(chunk_id)

            neighbors = self.vector_store.neighbor_chunks(
                document_id=chunk["document_id"],
                section_id=chunk["section_id"],
                chunk_index=int(chunk.get("chunk_index", 0)),
                window=settings.neighbor_window,
            )
            for neighbor in sorted(neighbors, key=lambda item: int(item["chunk_index"])):
                if not self._is_valid_chunk(neighbor):
                    continue

                neighbor_id = neighbor["chunk_id"]
                if neighbor_id in seen_ids:
                    continue

                expanded.append(
                    {
                        "score": result["score"] * 0.98,
                        "chunk": neighbor,
                    }
                )
                seen_ids.add(neighbor_id)

        return expanded

    def _is_valid_chunk(self, chunk: dict) -> bool:
        return all(
            chunk.get(field)
            for field in ("chunk_id", "document_id", "section_id", "text")
        )

    def _valid_results(self, results: list[dict]) -> list[dict]:
        return [
            result
            for result in results
            if self._is_valid_chunk(result.get("chunk", {}))
        ]
