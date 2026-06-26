from app.schemas.query import RetrievedSource
from app.config.settings import settings


class ContextService:
    def build_context(self, sources: list[RetrievedSource]) -> str:
        blocks = []
        for source in sources:
            remaining_chars = settings.context_total_max_chars - sum(
                len(block) for block in blocks
            )
            if remaining_chars <= 0:
                break

            text = self._truncate_text(source.text, settings.context_source_max_chars)
            blocks.append(
                f"[{source.source_id}] {self._source_label(source)}\n"
                f"{self._truncate_text(text, remaining_chars)}"
            )

        return "\n\n".join(blocks)

    def _source_label(self, source: RetrievedSource) -> str:
        filename = source.filename or "unknown file"
        heading = source.heading or "unknown section"
        page = f"page {source.page_no}" if source.page_no else "page unknown"
        return f"{filename} | {heading} | {page}"

    def _truncate_text(self, text: str, max_chars: int) -> str:
        if len(text) <= max_chars:
            return text

        truncated = text[:max_chars].rsplit(" ", 1)[0].strip()
        return f"{truncated}\n[Context truncated for prompt budget.]"
