import logging
from collections.abc import AsyncIterator

from groq import AsyncGroq

from app.config.settings import settings
from app.services.llm.base import BaseLLMProvider, LLMResponse
from app.services.prompt_service import PromptService


logger = logging.getLogger(__name__)


class GroqProvider(BaseLLMProvider):
    provider_name = "groq"

    def __init__(self, prompt_service: PromptService | None = None):
        self.model_name = settings.groq_model
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY is required for Groq provider")
        self.client = AsyncGroq(api_key=settings.groq_api_key)
        self.prompt_service = prompt_service or PromptService()

    async def generate(self, question: str, context: str) -> LLMResponse:
        prompt = self.prompt_service.build_prompt(question, context)
        try:
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=settings.llm_temperature,
                stream=False
            )
            return LLMResponse(
                text=response.choices[0].message.content or "",
                provider=self.provider_name,
                model=self.model_name,
            )
        except Exception as exc:
            logger.exception("Groq generation failed")
            raise RuntimeError(f"Groq generation failed: {exc}") from exc

    async def stream(self, question: str, context: str) -> AsyncIterator[str]:
        prompt = self.prompt_service.build_prompt(question, context)
        try:
            stream = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=settings.llm_temperature,
                stream=True
            )
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as exc:
            logger.exception("Groq streaming failed")
            raise RuntimeError(f"Groq streaming failed: {exc}") from exc
