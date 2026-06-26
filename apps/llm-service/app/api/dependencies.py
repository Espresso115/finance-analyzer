from app.config.settings import settings
from app.services.llm.providers import get_llm_provider
from app.services.llm_service import LLMService
from app.services.rag_service import RAGService


def get_rag_service() -> RAGService:
    llm_service: LLMService | None = None

    if settings.llm_provider != "retrieval":
        llm_service = LLMService(provider=get_llm_provider())

    return RAGService(llm_service=llm_service)
