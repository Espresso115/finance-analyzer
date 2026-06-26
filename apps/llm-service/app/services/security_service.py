import re
from pathlib import Path

from fastapi import UploadFile

from app.config.settings import settings


CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
SPACES_RE = re.compile(r"\s+")
SAFE_NAME_RE = re.compile(r"[^A-Za-z0-9_. -]")


class SecurityService:
    allowed_extensions = {".pdf", ".docx"}
    allowed_content_types = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
    }

    def sanitize_filename(self, filename: str) -> str:
        name = Path(filename or "uploaded_document").name
        name = SAFE_NAME_RE.sub("_", name)
        name = SPACES_RE.sub(" ", name).strip(" .")
        return name[:160] or "uploaded_document"

    def validate_upload(self, file: UploadFile, contents: bytes) -> str:
        filename = self.sanitize_filename(file.filename or "")
        extension = Path(filename).suffix.lower()

        if extension == ".doc":
            raise ValueError(
                "Legacy .doc files are not accepted. Please upload PDF or DOCX."
            )

        if extension not in self.allowed_extensions:
            raise ValueError("Only PDF and DOCX files are allowed.")

        if file.content_type not in self.allowed_content_types:
            raise ValueError("Unsupported file content type.")

        if not contents:
            raise ValueError("Uploaded file is empty.")

        if len(contents) > settings.max_upload_bytes:
            mb = settings.max_upload_bytes // (1024 * 1024)
            raise ValueError(f"Uploaded file exceeds the {mb} MB size limit.")

        self._validate_signature(extension, contents)
        return filename

    def sanitize_query(self, question: str) -> str:
        cleaned = CONTROL_CHARS_RE.sub(" ", question or "")
        cleaned = SPACES_RE.sub(" ", cleaned).strip()

        if not cleaned:
            raise ValueError("Question cannot be empty.")

        if len(cleaned) > settings.max_question_chars:
            raise ValueError(
                f"Question exceeds {settings.max_question_chars} characters."
            )

        return cleaned

    def sanitize_conversation_id(self, conversation_id: str | None) -> str:
        raw = conversation_id or "default"
        cleaned = re.sub(r"[^A-Za-z0-9_-]", "_", raw).strip("_")
        return (cleaned or "default")[:80]

    def _validate_signature(self, extension: str, contents: bytes) -> None:
        if extension == ".pdf" and not contents.startswith(b"%PDF-"):
            raise ValueError("Invalid PDF signature.")

        if extension == ".docx" and not contents.startswith(b"PK"):
            raise ValueError("Invalid DOCX signature.")
