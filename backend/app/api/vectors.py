from fastapi import APIRouter, HTTPException

from .. import settings
from ..schemas.vector import (
    SemanticSpaceOut,
    SpacePointOut,
    VectorDetailOut,
    VectorPointListOut,
    VectorPointOut,
    VectorStatsOut,
    VectorStatusOut,
)
from ..services import document_service, vector_store_service
from ..services.vector_store_service import VectorStoreError

router = APIRouter(prefix="/api/vectors", tags=["vectors"])


def _store_error(error: VectorStoreError) -> HTTPException:
    status = 404 if error.code == "not_found" else 503
    return HTTPException(
        status_code=status,
        detail={"code": error.code, "message": error.message},
    )


@router.get("/status", response_model=VectorStatusOut)
def vector_status() -> VectorStatusOut:
    if not vector_store_service.health():
        return VectorStatusOut(
            connected=False,
            collection=settings.QDRANT_COLLECTION,
            error_code="vector_store_unavailable",
        )
    try:
        info = vector_store_service.collection_info()
    except VectorStoreError as error:
        return VectorStatusOut(
            connected=False,
            collection=settings.QDRANT_COLLECTION,
            error_code=error.code,
        )
    return VectorStatusOut(connected=True, **info)


@router.get("/stats", response_model=VectorStatsOut)
def vector_stats() -> VectorStatsOut:
    documents = document_service.list_documents()
    total_chunks = sum(doc.chunk_count for doc in documents)
    embedded = sum(doc.embedding_count for doc in documents)
    try:
        vectors = vector_store_service.count()
        info = vector_store_service.collection_info()
    except VectorStoreError as error:
        raise _store_error(error) from error
    return VectorStatsOut(
        vectors=vectors,
        dimensions=info["dimensions"],
        documents=len(documents),
        total_chunks=total_chunks,
        embedded_chunks=embedded,
        indexed_percent=round(embedded / total_chunks * 100) if total_chunks else 0,
        average_chunks_per_document=(
            round(total_chunks / len(documents), 1) if documents else 0.0
        ),
    )


@router.get("/points", response_model=VectorPointListOut)
def list_points(limit: int = 100) -> VectorPointListOut:
    try:
        points = vector_store_service.scroll_points(limit=max(1, min(limit, 200)))
        total = vector_store_service.count()
    except VectorStoreError as error:
        raise _store_error(error) from error
    return VectorPointListOut(
        total=total,
        points=[
            VectorPointOut(
                id=point["id"],
                document_id=point.get("document_id", ""),
                document_name=point.get("document_name", ""),
                chunk_id=point.get("chunk_id", ""),
                chunk_index=int(point.get("chunk_index", 0)),
                page_start=int(point.get("page_start", 0)),
                page_end=int(point.get("page_end", 0)),
                estimated_tokens=int(point.get("estimated_tokens", 0)),
            )
            for point in points
        ],
    )


@router.get("/semantic-space", response_model=SemanticSpaceOut)
def semantic_space() -> SemanticSpaceOut:
    try:
        result = vector_store_service.semantic_space()
    except VectorStoreError as error:
        raise _store_error(error) from error
    return SemanticSpaceOut(
        method="PCA",
        dimensions=2,
        points=[SpacePointOut(**point) for point in result["points"]],
    )


@router.get("/points/{point_id}", response_model=VectorDetailOut)
def get_point(point_id: str) -> VectorDetailOut:
    try:
        point = vector_store_service.get_point(point_id)
    except VectorStoreError as error:
        raise _store_error(error) from error
    return VectorDetailOut(
        id=point["id"],
        document_id=point.get("document_id", ""),
        document_name=point.get("document_name", ""),
        chunk_id=point.get("chunk_id", ""),
        chunk_index=int(point.get("chunk_index", 0)),
        page_start=int(point.get("page_start", 0)),
        page_end=int(point.get("page_end", 0)),
        estimated_tokens=int(point.get("estimated_tokens", 0)),
        text=str(point.get("text", "")),
        dimensions=len(point.get("vector", [])),
        vector=[round(float(value), 5) for value in point.get("vector", [])],
    )


@router.delete("/document/{document_id}")
def delete_document_vectors(document_id: str) -> dict[str, bool]:
    try:
        vector_store_service.delete_document(document_id)
    except VectorStoreError as error:
        raise _store_error(error) from error
    return {"deleted": True}
