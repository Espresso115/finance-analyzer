from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class LLMResponse:
    text: str
    provider: str
    model: str
    usage: dict[str, Any] = field(default_factory=dict)


class BaseLLMProvider(ABC):
    provider_name: str
    model_name: str

    @abstractmethod
    async def generate(self, question: str, context: str) -> LLMResponse:
        raise NotImplementedError

    @abstractmethod
    async def stream(self, question: str, context: str) -> AsyncIterator[str]:
        raise NotImplementedError
