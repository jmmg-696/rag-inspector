"""Document orchestration and JSON-file storage.

Phase 2 intentionally uses a simple local data directory instead of a
database. Each document is stored as one JSON file under
``backend/data/documents`` (override with RAG_INSPECTOR_DATA_DIR).
"""

from __future__ import annotations

import json
import os
import re
import secrets
from datetime import datetime, timezone
from pathlib import Path

from ..models.document import DocumentPage, StoredDocument
from . import chunking_service, cleaning_service, embedding_service, extraction_service
from . import vector_store_service

DOCUMENT_ID_RE = re.compile(r"^doc-[a-z0-9]{6,40}$")

ACTIVE_STATUSES = {
    "uploaded",
    "extracting",
    "cleaning",
    "chunking",
    "embedding",
    "indexing",
}
EMBED_BATCH_SIZE = 32

DEFAULT_DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "documents"


class DocumentNotFound(Exception):
    pass


class InvalidDocumentId(Exception):
    pass


def data_dir() -> Path:
    directory = Path(os.environ.get("RAG_INSPECTOR_DATA_DIR", DEFAULT_DATA_DIR))
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def _path(document_id: str) -> Path:
    if not DOCUMENT_ID_RE.match(document_id):
        raise InvalidDocumentId(document_id)
    return data_dir() / f"{document_id}.json"


def ingest(
    filename: str,
    raw: bytes,
    chunk_size: int = chunking_service.DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = chunking_service.DEFAULT_OVERLAP,
) -> StoredDocument:
    pages = extraction_service.extract(filename, raw)
    pages, cleaning = cleaning_service.clean_pages(pages)
    full_text = "\n\n".join(page.text for page in pages)

    document = StoredDocument(
        id=f"doc-{secrets.token_hex(6)}",
        name=Path(filename).name[:120],
        type=extraction_service.extension_for(filename).lstrip("."),
        pages=pages,
        characters=len(full_text),
        words=len(full_text.split()),
        status="chunking",
        created_at=datetime.now(timezone.utc).isoformat(),
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        embedding_version=f"{chunk_size}:{chunk_overlap}",
        cleaning=cleaning,
    )
    document.chunk_count = len(chunks_for_pages(document, chunk_size, chunk_overlap))
    document.status = "embedding"
    _save(document)
    return document


def index_document(document_id: str) -> StoredDocument:
    """Embed every chunk of a document and upsert it into Qdrant.

    Idempotent: point ids are deterministic for
    (document, chunk settings, index), so re-indexing the same version
    overwrites instead of duplicating. Called from a background task.
    """
    document = get_document(document_id)
    try:
        if not document.embedding_version:
            document.embedding_version = (
                f"{document.chunk_size}:{document.chunk_overlap}"
            )
        chunks = chunks_for_pages(document)
        if document.status != "embedding":
            document.status = "embedding"
            _save(document)

        vectors: list[list[float]] = []
        for start in range(0, len(chunks), EMBED_BATCH_SIZE):
            batch = chunks[start : start + EMBED_BATCH_SIZE]
            vectors.extend(embedding_service.encode([c.text for c in batch]))

        document.status = "indexing"
        _save(document)

        dimensions = len(vectors[0]) if vectors else 0
        if dimensions:
            vector_store_service.ensure_collection(dimensions)
            ids = [
                vector_store_service.point_id(
                    document.id, document.embedding_version, chunk.index
                )
                for chunk in chunks
            ]
            payloads = [
                {
                    "document_id": document.id,
                    "document_name": document.name,
                    "chunk_id": chunk.id,
                    "chunk_index": chunk.index,
                    "page_start": chunk.page_start,
                    "page_end": chunk.page_end,
                    "text": chunk.text[:4000],
                    "estimated_tokens": chunk.estimated_tokens,
                }
                for chunk in chunks
            ]
            vector_store_service.upsert(vectors, payloads, ids)

        document.embedding_count = len(chunks)
        document.indexed_at = datetime.now(timezone.utc).isoformat()
        document.status = "ready"
        document.error_code = ""
        document.error_message = ""
    except (embedding_service.EmbeddingError, vector_store_service.VectorStoreError) as error:
        document.status = "error"
        document.error_code = error.code
        document.error_message = error.message
    except Exception as error:  # noqa: BLE001 - never silently fail
        document.status = "error"
        document.error_code = "embedding_failed"
        document.error_message = str(error)
    _save(document)
    return document


def chunks_for_pages(
    document: StoredDocument,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> list[chunking_service.Chunk]:
    return chunking_service.chunk_pages(
        document.id,
        document.pages,
        chunk_size if chunk_size is not None else document.chunk_size,
        chunk_overlap if chunk_overlap is not None else document.chunk_overlap,
    )


def list_documents() -> list[StoredDocument]:
    documents: list[StoredDocument] = []
    for path in data_dir().glob("doc-*.json"):
        try:
            documents.append(_read(path))
        except (json.JSONDecodeError, KeyError, TypeError, ValueError):
            continue  # skip corrupt files rather than breaking the API
    return sorted(documents, key=lambda doc: doc.created_at, reverse=True)


def get_document(document_id: str) -> StoredDocument:
    try:
        path = _path(document_id)
    except InvalidDocumentId as error:
        raise DocumentNotFound(document_id) from error
    if not path.exists():
        raise DocumentNotFound(document_id)
    return _read(path)


def delete_document(document_id: str) -> None:
    path = _path(document_id)
    if not path.exists():
        raise DocumentNotFound(document_id)
    path.unlink()


def save_document(document: StoredDocument) -> None:
    """Persist an updated document record (used by background pipelines)."""
    _save(document)


def _save(document: StoredDocument) -> None:
    path = _path(document.id)
    path.write_text(
        json.dumps(document.to_dict(), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def _read(path: Path) -> StoredDocument:
    return StoredDocument.from_dict(json.loads(path.read_text(encoding="utf-8")))


__all__ = [
    "ACTIVE_STATUSES",
    "DocumentPage",
    "DocumentNotFound",
    "InvalidDocumentId",
    "chunks_for_pages",
    "data_dir",
    "delete_document",
    "get_document",
    "index_document",
    "ingest",
    "list_documents",
    "save_document",
]
