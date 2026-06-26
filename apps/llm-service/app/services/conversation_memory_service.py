from typing import Any

from app.config.settings import ensure_data_directories, settings
from app.schemas.query import RetrievedSource
from app.utils.json_store import read_json, write_json


class ConversationMemoryService:
    def __init__(self):
        ensure_data_directories()
        settings.conversation_dir.mkdir(parents=True, exist_ok=True)

    def load(self, conversation_id: str) -> list[dict[str, Any]]:
        return read_json(self._path(conversation_id), [])

    def append(
        self,
        conversation_id: str,
        question: str,
        answer: str,
        sources: list[RetrievedSource],
    ) -> None:
        history = self.load(conversation_id)
        history.append(
            {
                "question": question,
                "answer": answer[:2000],
                "sources": [
                    {
                        "source_id": source.source_id,
                        "document_id": source.document_id,
                        "heading": source.heading,
                        "page_no": source.page_no,
                        "filename": source.filename,
                    }
                    for source in sources[:5]
                ],
            }
        )
        history = history[-settings.conversation_memory_turns :]
        write_json(self._path(conversation_id), history)

    def format_for_prompt(self, conversation_id: str) -> str:
        history = self.load(conversation_id)
        if not history:
            return ""

        blocks = []
        for index, item in enumerate(history[-settings.conversation_memory_turns :], start=1):
            blocks.append(
                f"Turn {index}\n"
                f"User: {item.get('question', '')}\n"
                f"Assistant: {item.get('answer', '')}"
            )

        return "\n\n".join(blocks)

    def _path(self, conversation_id: str):
        return settings.conversation_dir / f"{conversation_id}.json"
