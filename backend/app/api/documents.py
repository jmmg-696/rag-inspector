from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, Query, UploadFile

from ..models.document import StoredDocument
from ..schemas.document import (
    ChunkOut,
    ChunksResponseOut,
    CleaningOut,
    DeletedOut,
    DocumentDetailOut,
    DocumentSummaryOut,
    PageOut,
)
from ..services import chunking_service, document_service, vector_store_service
from ..services.chunking_service import ChunkingError
from ..services.document_service import DocumentNotFound
from ..services.extraction_service import ExtractionError
from ..services.vector_store_service import VectorStoreError

router = APIRouter(prefix="/api/documents", tags=["documents"])

_ERROR_STATUS = {
    "unsupported_type": 400,
    "empty_document": 400,
    "invalid_file": 400,
    "too_large": 413,
}


def _summary(document: StoredDocument) -> DocumentSummaryOut:
    return DocumentSummaryOut(
        id=document.id,
        name=document.name,
        type=document.type,
        page_count=len(document.pages),
        characters=document.characters,
        words=document.words,
        status=document.status,
        chunk_size=document.chunk_size,
        chunk_overlap=document.chunk_overlap,
        chunk_count=document.chunk_count,
        embedding_count=document.embedding_count,
        embedding_version=document.embedding_version,
        indexed_at=document.indexed_at,
        error_code=document.error_code,
        error_message=document.error_message,
        cleaning=CleaningOut(**document.cleaning.to_dict()),
        created_at=document.created_at,
    )


@router.post("/ingest", response_model=DocumentSummaryOut)
async def ingest_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    chunk_size: int = Form(chunking_service.DEFAULT_CHUNK_SIZE),
    chunk_overlap: int = Form(chunking_service.DEFAULT_OVERLAP),
) -> DocumentSummaryOut:
    raw = await file.read()
    try:
        document = document_service.ingest(
            filename=file.filename or "document.txt",
            raw=raw,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
    except ExtractionError as error:
        raise HTTPException(
            status_code=_ERROR_STATUS.get(error.code, 400),
            detail={"code": error.code, "message": error.message},
        ) from error
    except ChunkingError as error:
        raise HTTPException(
            status_code=422,
            detail={"code": error.code, "message": error.message},
        ) from error
    background_tasks.add_task(document_service.index_document, document.id)
    return _summary(document)


@router.post("/{document_id}/embed", response_model=DocumentSummaryOut)
def reindex_document(
    document_id: str, background_tasks: BackgroundTasks
) -> DocumentSummaryOut:
    try:
        document = document_service.get_document(document_id)
    except DocumentNotFound as error:
        raise _not_found(error) from error
    if document.status in document_service.ACTIVE_STATUSES:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "already_running",
                "message": "This document is already being processed.",
            },
        )
    document.status = "embedding"
    document.error_code = ""
    document.error_message = ""
    document_service.save_document(document)
    background_tasks.add_task(document_service.index_document, document.id)
    return _summary(document)


@router.get("", response_model=list[DocumentSummaryOut])
def list_documents() -> list[DocumentSummaryOut]:
    return [_summary(doc) for doc in document_service.list_documents()]


@router.get("/{document_id}", response_model=DocumentDetailOut)
def get_document(document_id: str) -> DocumentDetailOut:
    document = _get_or_404(document_id)
    return DocumentDetailOut(
        **_summary(document).model_dump(by_alias=False),
        pages=[
            PageOut(page=page.page, text=page.text, characters=len(page.text))
            for page in document.pages
        ],
    )


@router.get("/{document_id}/chunks", response_model=ChunksResponseOut)
def get_chunks(
    document_id: str,
    chunk_size: int = Query(chunking_service.DEFAULT_CHUNK_SIZE),
    chunk_overlap: int = Query(chunking_service.DEFAULT_OVERLAP),
) -> ChunksResponseOut:
    document = _get_or_404(document_id)
    try:
        chunks = document_service.chunks_for_pages(
            document, chunk_size, chunk_overlap
        )
    except ChunkingError as error:
        raise HTTPException(
            status_code=422,
            detail={"code": error.code, "message": error.message},
        ) from error
    return ChunksResponseOut(
        document_id=document.id,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        characters_per_token=chunking_service.CHARS_PER_TOKEN,
        total=len(chunks),
        chunks=[ChunkOut(**chunk.to_dict()) for chunk in chunks],
    )


@router.delete("/{document_id}", response_model=DeletedOut)
def delete_document(document_id: str) -> DeletedOut:
    try:
        document_service.get_document(document_id)
    except DocumentNotFound as error:
        raise _not_found(error) from error
    # Remove vectors first: deleting the document with vectors left behind
    # would create orphans in Qdrant.
    try:
        vector_store_service.delete_document(document_id)
    except VectorStoreError as error:
        raise HTTPException(
            status_code=503,
            detail={"code": error.code, "message": error.message},
        ) from error
    document_service.delete_document(document_id)
    return DeletedOut(deleted=True)


def _get_or_404(document_id: str) -> StoredDocument:
    try:
        return document_service.get_document(document_id)
    except DocumentNotFound as error:
        raise _not_found(error) from error


def _not_found(error: Exception) -> HTTPException:
    return HTTPException(
        status_code=404,
        detail={"code": "not_found", "message": "Document not found."},
    )
