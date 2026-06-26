import logging
from collections.abc import AsyncIterator

from google import genai

from app.config.settings import settings
from app.services.llm.base import BaseLLMProvider, LLMResponse
from app.services.prompt_service import PromptService


logger = logging.getLogger(__name__)


class GeminiProvider(BaseLLMProvider):
    provider_name = "gemini"

    def __init__(self, prompt_service: PromptService | None = None):
        self.model_name = settings.gemini_model
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is required for Gemini provider")
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.prompt_service = prompt_service or PromptService()

    async def generate(self, question: str, context: str) -> LLMResponse:
        prompt = self.prompt_service.build_prompt(question, context)
        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={"temperature": settings.llm_temperature}
            )
            return LLMResponse(
                text=response.text or "",
                provider=self.provider_name,
                model=self.model_name,
            )
        except Exception as exc:
            logger.exception("Gemini generation failed")
            raise RuntimeError(f"Gemini generation failed: {exc}") from exc

    async def stream(self, question: str, context: str) -> AsyncIterator[str]:
        prompt = self.prompt_service.build_prompt(question, context)
        try:
            response = await self.client.aio.models.generate_content_stream(
                model=self.model_name,
                contents=prompt,
                config={"temperature": settings.llm_temperature}
            )
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as exc:
            logger.exception("Gemini streaming failed")
            raise RuntimeError(f"Gemini streaming failed: {exc}") from exc
