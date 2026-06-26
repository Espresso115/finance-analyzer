import uuid
import hashlib
from pathlib import Path

from app.config.settings import ensure_data_directories, settings
from app.services.security_service import SecurityService
from app.utils.json_store import read_json, write_json


def save_uploaded_file(file, contents: bytes):
    ensure_data_directories()
    security = SecurityService()
    original_filename = security.validate_upload(file, contents)
    file_hash = hashlib.sha256(contents).hexdigest()

    documents = read_json(settings.documents_file, [])
    for document in documents:
        if document.get("file_hash") == file_hash:
            return document

    document_id = str(uuid.uuid4())

    extension = Path(original_filename).suffix.lower()
    stored_filename = f"{document_id}{extension}"

    filepath = settings.upload_dir / stored_filename

    with open(filepath, "wb") as f:
        f.write(contents)

    metadata = {
        "document_id": document_id,
        "filename": original_filename,
        "file_path": str(filepath),
        "size_bytes": len(contents),
        "file_hash": file_hash,
        "status": "uploaded"
    }

    documents.append(metadata)

    write_json(settings.documents_file, documents)

    return metadata
