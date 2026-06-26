from pathlib import Path
import json

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption

from app.config.settings import settings


def _build_converter() -> DocumentConverter:
    pdf_options = PdfPipelineOptions(
        do_ocr=settings.docling_do_ocr,
        do_table_structure=settings.docling_do_table_structure,
        ocr_batch_size=settings.docling_batch_size,
        layout_batch_size=settings.docling_batch_size,
        table_batch_size=settings.docling_batch_size,
        generate_page_images=False,
        generate_picture_images=False,
        generate_table_images=False,
    )

    return DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pdf_options),
        }
    )


converter = _build_converter()


def parse_pdf(pdf_path: str):

    print(f"Starting conversion: {pdf_path}")

    result = converter.convert(
        Path(pdf_path)
    )

    print("Conversion completed successfully")

    return result


def parse_document(document_path: str):
    return parse_pdf(document_path)


def save_processed_document(
    document_id: str,
    document
):
    filepath = settings.processed_dir / f"{document_id}.json"

    exported = document.export_to_dict()

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(
            exported,
            f,
            indent=4,
            ensure_ascii=False
        )

    return str(filepath)
