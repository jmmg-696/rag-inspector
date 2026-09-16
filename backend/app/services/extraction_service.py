"""Text extraction for supported document formats.

Supported: PDF (PyMuPDF), DOCX (python-docx), TXT and Markdown.

Security note: uploaded files are ONLY ever parsed with the libraries below.
Their content is treated as plain text and never executed, rendered or
interpreted (no embedded scripts, links or formulas).

Raises ExtractionError with a stable `code` so the API layer can return
useful, machine-readable errors.
"""

from __future__ import annotations

import io
import zipfile

import pymupdf  # PyMuPDF
from docx import Document as DocxDocument

from ..models.document import DocumentPage

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB per file


class ExtractionError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def extension_for(filename: str) -> str:
    lowered = filename.lower()
    for ext in ALLOWED_EXTENSIONS:
        if lowered.endswith(ext):
            return ext
    return ""


def extract(filename: str, raw: bytes) -> list[DocumentPage]:
    """Extract page-structured text from raw file bytes."""
    if not raw:
        raise ExtractionError("empty_document", "The uploaded file is empty.")
    if len(raw) > MAX_FILE_SIZE:
        raise ExtractionError(
            "too_large",
            f"File exceeds the {MAX_FILE_SIZE // (1024 * 1024)} MB limit.",
        )

    ext = extension_for(filename)
    if not ext:
        raise ExtractionError(
            "unsupported_type",
            "RAG Inspector currently supports PDF, DOCX, TXT and Markdown files.",
        )

    if ext == ".pdf":
        pages = _extract_pdf(raw)
    elif ext == ".docx":
        pages = _extract_docx(raw)
    else:
        pages = _extract_plain(raw)

    if not "".join(page.text for page in pages).strip():
        raise ExtractionError(
            "empty_document",
            "No readable text was found in this document.",
        )
    return pages


def _extract_pdf(raw: bytes) -> list[DocumentPage]:
    try:
        with pymupdf.open(stream=raw, filetype="pdf") as pdf:
            return [
                DocumentPage(page=index + 1, text=pdf[index].get_text("text"))
                for index in range(pdf.page_count)
            ]
    except Exception as error:  # noqa: BLE001 - surface any parse failure
        raise ExtractionError(
            "invalid_file", "The PDF could not be parsed. Is it a valid file?"
        ) from error


def _extract_docx(raw: bytes) -> list[DocumentPage]:
    if not raw.startswith(b"PK"):
        raise ExtractionError(
            "invalid_file", "The DOCX file is not a valid Office document."
        )
    try:
        with zipfile.ZipFile(io.BytesIO(raw)):
            document = DocxDocument(io.BytesIO(raw))
            paragraphs = [
                paragraph.text
                for paragraph in document.paragraphs
                if paragraph.text.strip()
            ]
    except Exception as error:  # noqa: BLE001 - surface any parse failure
        raise ExtractionError(
            "invalid_file", "The DOCX could not be parsed. Is it a valid file?"
        ) from error

    # DOCX has no fixed pagination — paragraphs become one logical page.
    return [DocumentPage(page=1, text="\n\n".join(paragraphs))]


def _extract_plain(raw: bytes) -> list[DocumentPage]:
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        text = raw.decode("latin-1")
    return [DocumentPage(page=1, text=text)]
