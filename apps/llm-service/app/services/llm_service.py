from collections.abc import AsyncIterator

from app.services.llm.base import BaseLLMProvider, LLMResponse


class LLMService:
    def __init__(self, provider: BaseLLMProvider):
        self.provider = provider

    async def generate(self, question: str, context: str) -> LLMResponse:
        return await self.provider.generate(question=question, context=context)

    async def stream(self, question: str, context: str) -> AsyncIterator[str]:
        async for token in self.provider.stream(
            question=question,
            context=context,
        ):
            yield token
