import uuid
from pathlib import Path

from app.schemas.processed_documents import (
    ProcessedDocument,
    Section,
)


class Parser:
    def parse(
        self,
        pdf_path: str,
        document_id: str | None = None,
        filename: str | None = None,
    ) -> ProcessedDocument:
        from app.services.docling_service import parse_pdf

        result = parse_pdf(pdf_path)
        docling_json = result.document.export_to_dict()

        return self.parse_docling_output(
            document_id=document_id or str(uuid.uuid4()),
            filename=filename or Path(pdf_path).name,
            docling_json=docling_json,
        )

    def parse_docling_output(
        self,
        document_id: str,
        filename: str,
        docling_json: dict,
    ) -> ProcessedDocument:
        sections = []

        current_heading = "Introduction"
        current_content = []
        current_page = 1

        for item in docling_json.get("texts", []):
            label = item.get("label")
            text = item.get("text", "").strip()
            page_no = _extract_page_no(item) or current_page

            if not text:
                continue

            if label == "section_header":
                if current_content:
                    sections.append(
                        Section(
                            section_id=str(uuid.uuid4()),
                            heading=current_heading,
                            content="\n".join(current_content),
                            page_no=current_page,
                        )
                    )

                current_heading = text
                current_content = []
                current_page = page_no

            elif label in ["text", "list_item", "paragraph"]:
                current_page = page_no
                current_content.append(text)

        if current_content:
            sections.append(
                Section(
                    section_id=str(uuid.uuid4()),
                    heading=current_heading,
                    content="\n".join(current_content),
                    page_no=current_page,
                )
            )

        return ProcessedDocument(
            document_id=document_id,
            filename=filename,
            title=filename,
            sections=sections,
        )


def _extract_page_no(item: dict) -> int | None:
    prov = item.get("prov", [])
    if not prov:
        return None

    page_no = prov[0].get("page_no")
    if page_no is None:
        return None

    try:
        return int(page_no)
    except (TypeError, ValueError):
        return None


def parse_docling_output(
    document_id: str,
    filename: str,
    docling_json: dict,
) -> ProcessedDocument:
    return Parser().parse_docling_output(
        document_id=document_id,
        filename=filename,
        docling_json=docling_json,
    )
