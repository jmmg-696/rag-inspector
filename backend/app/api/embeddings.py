from fastapi import APIRouter, BackgroundTasks, HTTPException

from ..schemas.embedding import (
    EmbeddingModelOut,
    EmbeddingPreviewIn,
    EmbeddingPreviewOut,
    QueryEmbeddingIn,
    QueryEmbeddingOut,
)
from .. import settings
from ..services import document_service, embedding_service, vector_store_service
from ..services.chunking_service import ChunkingError
from ..services.document_service import DocumentNotFound
from ..services.embedding_service import EmbeddingError

router = APIRouter(prefix="/api/embeddings", tags=["embeddings"])

_ERROR_STATUS = {
    "embedding_model_unavailable": 503,
    "embedding_failed": 502,
    "vector_store_unavailable": 503,
}


def _embedding_http_error(error: Exception) -> HTTPException:
    return HTTPException(
        status_code=_ERROR_STATUS.get(error.code, 502),
        detail={"code": error.code, "message": error.message},
    )


@router.get("/model", response_model=EmbeddingModelOut)
def get_model_metadata() -> EmbeddingModelOut:
    return EmbeddingModelOut(**embedding_service.metadata())


@router.post("/preview", response_model=EmbeddingPreviewOut)
def preview_chunk_embedding(body: EmbeddingPreviewIn) -> EmbeddingPreviewOut:
    try:
        document = document_service.get_document(body.document_id)
    except DocumentNotFound as error:
        raise HTTPException(
            status_code=404,
            detail={"code": "not_found", "message": "Document not found."},
        ) from error
    try:
        chunks = document_service.chunks_for_pages(document)
    except ChunkingError as error:
        raise HTTPException(
            status_code=422, detail={"code": error.code, "message": error.message}
        ) from error
    if body.chunk_index >= len(chunks):
        raise HTTPException(
            status_code=404,
            detail={
                "code": "not_found",
                "message": "Chunk index is outside this document.",
            },
        )
    chunk = chunks[body.chunk_index]
    try:
        vector = embedding_service.encode_one(chunk.text)
    except EmbeddingError as error:
        raise _embedding_http_error(error) from error
    return EmbeddingPreviewOut(
        chunk_id=chunk.id,
        point_id=vector_store_service.point_id(
            document.id, document.embedding_version, chunk.index
        ),
        document_id=document.id,
        model=settings.EMBEDDING_MODEL_NAME,
        dimensions=len(vector),
        vector_preview=vector[: settings.VECTOR_PREVIEW_VALUES],
        status="ready",
    )


@router.post("/query", response_model=QueryEmbeddingOut)
def embed_query(body: QueryEmbeddingIn) -> QueryEmbeddingOut:
    try:
        vector = embedding_service.encode_one(body.text)
    except EmbeddingError as error:
        raise _embedding_http_error(error) from error
    return QueryEmbeddingOut(
        model=settings.EMBEDDING_MODEL_NAME,
        dimensions=len(vector),
        vector_preview=vector[: settings.VECTOR_PREVIEW_VALUES],
        status="ready",
    )
