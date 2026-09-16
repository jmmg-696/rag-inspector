from fastapi import APIRouter, HTTPException

from ..schemas.retrieval import (
    QueryEmbeddingMetaOut,
    RetrievalHitOut,
    RetrievalSearchIn,
    RetrievalSearchOut,
    RetrievalSpaceOut,
    RetrievalSpacePointOut,
    RetrievalSpaceQueryOut,
)
from ..services import retrieval_service
from ..services.embedding_service import EmbeddingError
from ..services.vector_store_service import VectorStoreError

router = APIRouter(prefix="/api/retrieval", tags=["retrieval"])

_ERROR_STATUS = {
    "embedding_model_unavailable": 503,
    "embedding_failed": 502,
    "vector_store_unavailable": 503,
    "collection_mismatch": 503,
    "not_found": 404,
}


def _to_http(error: Exception) -> HTTPException:
    return HTTPException(
        status_code=_ERROR_STATUS.get(error.code, 502),
        detail={"code": error.code, "message": error.message},
    )


@router.post("/search", response_model=RetrievalSearchOut)
def search(body: RetrievalSearchIn) -> RetrievalSearchOut:
    try:
        result = retrieval_service.search(
            query=body.query,
            top_k=body.top_k,
            score_threshold=body.score_threshold,
            document_id=body.document_id,
            include_embedding=body.include_embedding,
        )
    except (EmbeddingError, VectorStoreError) as error:
        raise _to_http(error) from error
    embedding = result["query_embedding"]
    return RetrievalSearchOut(
        query=result["query"],
        query_embedding=QueryEmbeddingMetaOut(
            model=embedding["model"],
            dimensions=embedding["dimensions"],
            vector=embedding["vector"],
        ),
        results=[RetrievalHitOut(**hit) for hit in result["results"]],
        total_results=result["total_results"],
        corpus_size=result["corpus_size"],
        top_k=result["top_k"],
        score_threshold=result["score_threshold"],
        filtered_document_id=result["filtered_document_id"],
    )


@router.post("/semantic-space", response_model=RetrievalSpaceOut)
def space(body: RetrievalSearchIn) -> RetrievalSpaceOut:
    try:
        result = retrieval_service.semantic_space(
            query=body.query,
            top_k=body.top_k,
            score_threshold=body.score_threshold,
            document_id=body.document_id,
        )
    except (EmbeddingError, VectorStoreError) as error:
        raise _to_http(error) from error
    return RetrievalSpaceOut(
        method=result["method"],
        dimensions=result["dimensions"],
        model=result["model"],
        points=[RetrievalSpacePointOut(**point) for point in result["points"]],
        query=RetrievalSpaceQueryOut(**result["query"]) if result["query"] else None,
    )
