from app.config.settings import settings
from app.services.llm.base import BaseLLMProvider
from app.services.llm.gemini_provider import GeminiProvider
from app.services.llm.groq_provider import GroqProvider


def get_llm_provider() -> BaseLLMProvider:
    provider = settings.llm_provider.lower()

    if provider == "gemini":
        return GeminiProvider()
    elif provider == "groq":
        return GroqProvider()

    raise ValueError(
        "Invalid generation provider. Set LLM_PROVIDER to 'gemini' or 'groq'."
    )
