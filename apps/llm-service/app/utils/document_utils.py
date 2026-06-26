from app.config.settings import ensure_data_directories, settings
from app.utils.json_store import read_json, write_json


def list_documents():
    ensure_data_directories()
    return read_json(settings.documents_file, [])


def get_document(document_id):
    docs = list_documents()

    for doc in docs:

        if doc["document_id"] == document_id:
            return doc

    return None


def update_document(document_id: str, **updates):
    docs = list_documents()

    for index, doc in enumerate(docs):
        if doc["document_id"] == document_id:
            docs[index] = {**doc, **updates}
            write_json(settings.documents_file, docs)
            return docs[index]

    return None


def set_document_status(document_id: str, status: str, **updates):
    return update_document(document_id, status=status, **updates)
