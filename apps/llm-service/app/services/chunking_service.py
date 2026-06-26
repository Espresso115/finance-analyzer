import uuid
import tiktoken

from app.schemas.chunk import Chunk
from app.utils.text_utils import content_hash, detect_sec_section_code


class Chunker:

    def __init__(
        self,
        chunk_size: int = 512,
        overlap: int = 75
    ):
        self.chunk_size = chunk_size
        self.overlap = overlap

        if self.chunk_size <= 0:
            raise ValueError("chunk_size must be greater than 0")
        if self.overlap < 0:
            raise ValueError("overlap must be greater than or equal to 0")
        if self.overlap >= self.chunk_size:
            raise ValueError("overlap must be smaller than chunk_size")

        self.encoding = tiktoken.get_encoding(
            "cl100k_base"
        )

    def tokenize(self, text: str):
        return self.encoding.encode(text)

    def detokenize(self, tokens):
        return self.encoding.decode(tokens)

    def chunk_text(self, text: str):

        tokens = self.tokenize(text)
        if not tokens:
            return []

        chunks = []

        start = 0

        while start < len(tokens):

            end = start + self.chunk_size

            chunk_tokens = tokens[start:end]

            chunks.append(
                self.detokenize(chunk_tokens)
            )

            start += (
                self.chunk_size
                - self.overlap
            )

        return chunks

    def create_chunks(
        self,
        document_id: str,
        section
    ):

        chunk_texts = self.chunk_text(
            section.content
        )

        chunks = []

        for idx, text in enumerate(
            chunk_texts
        ):
            section_code = detect_sec_section_code(section.heading)

            chunk = Chunk(
                chunk_id=str(
                    uuid.uuid4()
                ),

                document_id=document_id,

                section_id=section.section_id,

                text=text,

                chunk_index=idx,

                start_char=0,
                end_char=len(text),

                metadata={
                    "heading": section.heading,
                    "page_no": section.page_no,
                    "document_id": document_id,
                    "section_id": section.section_id,
                    "section_code": section_code or "",
                    "heading_path": section.heading,
                    "content_hash": content_hash(text),
                }
            )

            chunks.append(chunk)

        return chunks

    def chunk_document(
        self,
        processed_document
    ):

        all_chunks = []

        for section in (
            processed_document.sections
        ):

            section_chunks = (
                self.create_chunks(
                    processed_document.document_id,
                    section
                )
            )

            all_chunks.extend(
                section_chunks
            )

        return all_chunks
