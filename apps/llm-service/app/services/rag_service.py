import logging
from collections.abc import AsyncIterator
from time import perf_counter

from app.config.settings import settings
from app.schemas.query import QueryResponse
from app.services.conversation_memory_service import ConversationMemoryService
from app.services.context_service import ContextService
from app.services.llm.base import LLMResponse
from app.services.llm_cache_service import LLMCacheService
from app.services.llm_service import LLMService
from app.services.retrieval_service import RetrievalService
from app.services.security_service import SecurityService


logger = logging.getLogger(__name__)


class RAGService:
    def __init__(
        self,
        retrieval_service: RetrievalService | None = None,
        context_service: ContextService | None = None,
        llm_service: LLMService | None = None,
        cache_service: LLMCacheService | None = None,
        memory_service: ConversationMemoryService | None = None,
        security_service: SecurityService | None = None,
    ):
        self.retrieval_service = retrieval_service or RetrievalService()
        self.context_service = context_service or ContextService()
        self.llm_service = llm_service
        self.cache_service = cache_service or LLMCacheService()
        self.memory_service = memory_service or ConversationMemoryService()
        self.security_service = security_service or SecurityService()

    async def answer(
        self,
        question: str,
        top_k: int | None = None,
        document_ids: list[str] | None = None,
        generate_answer: bool = True,
        conversation_id: str | None = "default",
    ) -> QueryResponse:
        question = self.security_service.sanitize_query(question)
        conversation_id = self.security_service.sanitize_conversation_id(
            conversation_id
        )
        total_start = perf_counter()
        retrieval_start = perf_counter()
        sources = self.retrieval_service.retrieve(
            question=question,
            top_k=top_k or settings.retrieval_top_k,
            document_ids=document_ids,
        )
        retrieval_latency = perf_counter() - retrieval_start
        source_context = self.context_service.build_context(sources)
        memory_context = self.memory_service.format_for_prompt(conversation_id)
        context = self._join_contexts(source_context, memory_context)

        if not sources:
            self._log_timings(retrieval_latency, 0.0, total_start)
            response = QueryResponse(
                question=question,
                answer="No indexed context matched the question.",
                provider="retrieval",
                sources=[],
                prompt=context,
                conversation_id=conversation_id,
            )
            self.memory_service.append(
                conversation_id,
                question,
                response.answer,
                response.sources,
            )
            return response

        if not generate_answer:
            self._log_timings(retrieval_latency, 0.0, total_start)
            answer = "Answer generation skipped; returning retrieved sources."
            provider = "retrieval"
            cached = False
        else:
            if self.llm_service is None:
                raise ValueError(
                    "LLM generation requested but no provider is configured."
                )

            generation_start = perf_counter()
            provider_name = self.llm_service.provider.provider_name
            cached_entry = self.cache_service.get(
                question,
                source_context,
                provider_name,
            )
            if cached_entry:
                llm_response = LLMResponse(
                    text=cached_entry["answer"],
                    provider=provider_name,
                    model=self.llm_service.provider.model_name,
                    usage=cached_entry.get("usage", {}),
                )
                cached = True
            else:
                llm_response = await self.llm_service.generate(
                    question=question,
                    context=context,
                )
                self.cache_service.set(
                    question,
                    source_context,
                    llm_response.provider,
                    llm_response.text,
                    llm_response.usage,
                )
                cached = False
            generation_latency = perf_counter() - generation_start
            self._log_timings(
                retrieval_latency,
                generation_latency,
                total_start,
                llm_response.usage,
            )
            answer = llm_response.text
            provider = llm_response.provider

        response = QueryResponse(
            question=question,
            answer=answer,
            provider=provider,
            sources=sources,
            prompt=context,
            conversation_id=conversation_id,
            cached=cached,
        )
        self.memory_service.append(
            conversation_id,
            question,
            response.answer,
            response.sources,
        )
        return response

    async def stream_answer(
        self,
        question: str,
        top_k: int | None = None,
        document_ids: list[str] | None = None,
        conversation_id: str | None = "default",
    ) -> AsyncIterator[str]:
        if self.llm_service is None:
            raise ValueError("Streaming requires a configured LLM_PROVIDER (e.g., gemini or groq).")

        question = self.security_service.sanitize_query(question)
        conversation_id = self.security_service.sanitize_conversation_id(
            conversation_id
        )
        total_start = perf_counter()
        retrieval_start = perf_counter()
        sources = self.retrieval_service.retrieve(
            question=question,
            top_k=top_k or settings.retrieval_top_k,
            document_ids=document_ids,
        )
        retrieval_latency = perf_counter() - retrieval_start
        source_context = self.context_service.build_context(sources)
        memory_context = self.memory_service.format_for_prompt(conversation_id)
        context = self._join_contexts(source_context, memory_context)

        if not sources:
            self._log_timings(retrieval_latency, 0.0, total_start)
            yield "No indexed context matched the question."
            return

        generation_start = perf_counter()
        async for token in self.llm_service.stream(question, context):
            # Streaming responses are not cached because tokens are emitted
            # incrementally and clients may disconnect mid-generation.
            yield token

        self._log_timings(
            retrieval_latency,
            perf_counter() - generation_start,
            total_start,
        )

    def _log_timings(
        self,
        retrieval_latency: float,
        generation_latency: float,
        total_start: float,
        usage: dict | None = None,
    ) -> None:
        logger.info(
            "query timings retrieval=%.3fs generation=%.3fs total=%.3fs",
            retrieval_latency,
            generation_latency,
            perf_counter() - total_start,
        )
        if usage:
            logger.info("llm token usage %s", usage)

    def _join_contexts(self, source_context: str, memory_context: str) -> str:
        if not memory_context:
            return source_context

        return (
            "Retrieved source context. Use this as the only factual evidence:\n"
            f"{source_context}\n\n"
            "Recent conversation history. Use only for follow-up continuity, "
            "not as source evidence:\n"
            f"{memory_context}"
        )
