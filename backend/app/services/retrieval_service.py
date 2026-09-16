"""Semantic retrieval: question → BGE-M3 query embedding → Qdrant top-K.

Reuses the existing embedding singleton (never loads a second model) and
the existing vector store boundary (never touches Qdrant directly).

The scores returned here are REAL cosine similarities computed by Qdrant.
They are retrieval similarity scores — not confidence, correctness or
probability.
"""

from __future__ import annotations

from typing import Any

from .. import settings
from . import embedding_service, vector_store_service


def search(
    query: str,
    top_k: int = 5,
    score_threshold: float = 0.0,
    document_id: str | None = None,
    include_embedding: bool = False,
) -> dict[str, Any]:
    vector = embedding_service.encode_one(query)
    hits = vector_store_service.search(
        vector,
        limit=top_k,
        score_threshold=score_threshold if score_threshold > 0 else None,
        document_id=document_id or None,
    )
    corpus_size = vector_store_service.count()

    results = [
        {
            "rank": index + 1,
            "score": round(hit["score"], 4),
            "point_id": hit["id"],
            "chunk_id": str(hit.get("chunk_id", "")),
            "document_id": str(hit.get("document_id", "")),
            "document_name": str(hit.get("document_name", "")),
            "chunk_index": int(hit.get("chunk_index", index)),
            "page_start": int(hit.get("page_start", 0)),
            "page_end": int(hit.get("page_end", 0)),
            "estimated_tokens": int(hit.get("estimated_tokens", 0)),
            "text": str(hit.get("text", "")),
        }
        for index, hit in enumerate(hits)
    ]

    return {
        "query": query,
        "query_embedding": {
            "model": settings.EMBEDDING_MODEL_NAME,
            "dimensions": len(vector),
            "vector": vector if include_embedding else None,
        },
        "results": results,
        "total_results": len(results),
        "corpus_size": corpus_size,
        "top_k": top_k,
        "score_threshold": score_threshold,
        "filtered_document_id": document_id,
    }


def semantic_space(
    query: str,
    top_k: int = 5,
    score_threshold: float = 0.0,
    document_id: str | None = None,
) -> dict[str, Any]:
    """PCA projection of the corpus + this query's embedding.

    Points flagged as retrieved carry the Qdrant similarity score — never a
    2D distance. The projection only positions points for inspection.
    """
    vector = embedding_service.encode_one(query)
    hits = vector_store_service.search(
        vector,
        limit=top_k,
        score_threshold=score_threshold if score_threshold > 0 else None,
        document_id=document_id or None,
    )
    score_by_point = {hit["id"]: round(hit["score"], 4) for hit in hits}

    projection = vector_store_service.semantic_space(query_vector=vector)
    points = [
        {
            **point,
            "retrieved": point["point_id"] in score_by_point,
            "score": score_by_point.get(point["point_id"]),
        }
        for point in projection["points"]
    ]
    return {
        "method": "PCA",
        "dimensions": 2,
        "model": settings.EMBEDDING_MODEL_NAME,
        "points": points,
        "query": projection["query"],
    }
