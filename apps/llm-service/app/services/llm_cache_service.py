import hashlib
import time
from typing import Any

from app.config.settings import ensure_data_directories, settings
from app.utils.json_store import read_json, write_json


class LLMCacheService:
    def __init__(self):
        ensure_data_directories()
        self.path = settings.llm_cache_file

    def get(self, question: str, context: str, provider: str) -> dict[str, Any] | None:
        if not settings.llm_cache_enabled:
            return None

        cache = self._load()
        key = self._key(question, context, provider)
        entry = cache.get(key)

        if not entry:
            return None

        if time.time() - entry.get("created_at", 0) > settings.llm_cache_ttl_seconds:
            cache.pop(key, None)
            write_json(self.path, cache)
            return None

        return entry

    def set(
        self,
        question: str,
        context: str,
        provider: str,
        answer: str,
        usage: dict[str, Any] | None = None,
    ) -> None:
        if not settings.llm_cache_enabled:
            return

        cache = self._load()
        key = self._key(question, context, provider)
        cache[key] = {
            "answer": answer,
            "usage": usage or {},
            "provider": provider,
            "created_at": time.time(),
        }

        while len(cache) > settings.llm_cache_max_entries:
            oldest_key = min(cache, key=lambda item: cache[item]["created_at"])
            cache.pop(oldest_key, None)

        write_json(self.path, cache)

    def _load(self) -> dict[str, Any]:
        return read_json(self.path, {})

    def _key(self, question: str, context: str, provider: str) -> str:
        raw = f"{provider}\n{question}\n{context}".encode("utf-8")
        return hashlib.sha256(raw).hexdigest()
