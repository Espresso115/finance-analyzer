import os
import logging
from dataclasses import dataclass
from pathlib import Path

from dotenv import find_dotenv, load_dotenv


load_dotenv(find_dotenv())



BASE_DIR = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class Settings:
    app_name: str = "RAG Backend"
    data_dir: Path = BASE_DIR / "data"
    upload_dir: Path = BASE_DIR / "data" / "uploads"
    processed_dir: Path = BASE_DIR / "data" / "processed"
    vector_store_dir: Path = BASE_DIR / "data" / "vector_store"
    chroma_dir: Path = Path(os.getenv("CHROMA_PERSIST_DIR", str(BASE_DIR / "data" / "chroma")))
    cache_dir: Path = BASE_DIR / "data" / "cache"
    conversation_dir: Path = BASE_DIR / "data" / "conversations"
    documents_file: Path = BASE_DIR / "data" / "documents.json"
    vector_chunks_file: Path = BASE_DIR / "data" / "vector_store" / "chunks.json"
    llm_cache_file: Path = BASE_DIR / "data" / "cache" / "llm_cache.json"
    vector_backend: str = os.getenv("VECTOR_BACKEND", "chroma").lower()
    chroma_collection: str = os.getenv("CHROMA_COLLECTION", "financial_reports")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
    embedding_device: str = os.getenv("EMBEDDING_DEVICE", "cpu")
    embedding_batch_size: int = int(os.getenv("EMBEDDING_BATCH_SIZE", "32"))
    embedding_local_files_only: bool = (
        os.getenv("EMBEDDING_LOCAL_FILES_ONLY", "false").lower()
        in {"1", "true", "yes"}
    )
    chunk_size: int = int(os.getenv("CHUNK_SIZE", "512"))
    chunk_overlap: int = int(os.getenv("CHUNK_OVERLAP", "75"))
    retrieval_top_k: int = int(os.getenv("RETRIEVAL_TOP_K", "6"))
    max_retrieval_top_k: int = int(os.getenv("MAX_RETRIEVAL_TOP_K", "12"))
    retrieval_candidate_multiplier: int = int(
        os.getenv("RETRIEVAL_CANDIDATE_MULTIPLIER", "5")
    )
    neighbor_window: int = int(os.getenv("NEIGHBOR_WINDOW", "2"))
    rrf_k: int = int(os.getenv("RRF_K", "60"))
    section_boost_score: float = float(os.getenv("SECTION_BOOST_SCORE", "1.5"))
    dedup_text_prefix_chars: int = int(os.getenv("DEDUP_TEXT_PREFIX_CHARS", "500"))
    context_source_max_chars: int = int(os.getenv("CONTEXT_SOURCE_MAX_CHARS", "1200"))
    context_total_max_chars: int = int(os.getenv("CONTEXT_TOTAL_MAX_CHARS", "5000"))
    max_question_chars: int = int(os.getenv("MAX_QUESTION_CHARS", "2000"))
    max_upload_bytes: int = int(os.getenv("MAX_UPLOAD_MB", "100")) * 1024 * 1024
    llm_provider: str = os.getenv("LLM_PROVIDER", "retrieval").lower()
    llm_timeout_seconds: float = float(os.getenv("LLM_TIMEOUT_SECONDS", "60"))
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama3-8b-8192")
    llm_temperature: float = float(os.getenv("LLM_TEMPERATURE", "0.2"))
    llm_cache_enabled: bool = (
        os.getenv("LLM_CACHE_ENABLED", "true").lower()
        in {"1", "true", "yes"}
    )
    llm_cache_ttl_seconds: int = int(os.getenv("LLM_CACHE_TTL_SECONDS", "86400"))
    llm_cache_max_entries: int = int(os.getenv("LLM_CACHE_MAX_ENTRIES", "200"))
    conversation_memory_turns: int = int(os.getenv("CONVERSATION_MEMORY_TURNS", "5"))
    docling_do_ocr: bool = (
        os.getenv("DOCLING_DO_OCR", "false").lower()
        in {"1", "true", "yes"}
    )
    docling_do_table_structure: bool = (
        os.getenv("DOCLING_DO_TABLE_STRUCTURE", "true").lower()
        in {"1", "true", "yes"}
    )
    docling_batch_size: int = int(os.getenv("DOCLING_BATCH_SIZE", "1"))
    log_level: str = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)


def ensure_data_directories() -> None:
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    settings.processed_dir.mkdir(parents=True, exist_ok=True)
    settings.vector_store_dir.mkdir(parents=True, exist_ok=True)
    settings.chroma_dir.mkdir(parents=True, exist_ok=True)
    settings.cache_dir.mkdir(parents=True, exist_ok=True)
    settings.conversation_dir.mkdir(parents=True, exist_ok=True)
    if not settings.documents_file.exists():
        settings.documents_file.write_text("[]", encoding="utf-8")
    if not settings.vector_chunks_file.exists():
        settings.vector_chunks_file.write_text("[]", encoding="utf-8")
