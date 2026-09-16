"""Qdrant vector store — the ONLY module that talks to Qdrant.

Collections, point ids, upserts, scrolling and the PCA projection all
live behind this interface. The rest of the app never imports
qdrant_client directly.

Point ids are deterministic UUIDs derived from
(document_id, chunk_version, chunk_index): re-embedding the same chunks
with the same settings overwrites the same points — no duplicates, no
orphans. Changing chunk settings changes the version and regenerates.
"""

from __future__ import annotations

import uuid
from typing import Any

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    FilterSelector,
    MatchValue,
    PointStruct,
    VectorParams,
)

from .. import settings


class VectorStoreError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


_client: QdrantClient | None = None
_client_url: str = ""


def get_client() -> QdrantClient:
    global _client, _client_url
    url = settings.QDRANT_URL
    if _client is not None and _client_url == url:
        return _client
    if url == ":memory:":
        _client = QdrantClient(location=":memory:", prefix="test")
    else:
        _client = QdrantClient(url=url, timeout=settings.QDRANT_TIMEOUT_SECONDS)
    _client_url = url
    return _client


def reset_client_for_tests() -> None:
    global _client, _client_url
    _client = None
    _client_url = ""


def point_id(document_id: str, chunk_version: str, chunk_index: int) -> str:
    return str(
        uuid.uuid5(
            uuid.UUID(settings.POINT_ID_NAMESPACE),
            f"{document_id}|{chunk_version}|{chunk_index}",
        )
    )


def ensure_collection(dimensions: int) -> None:
    _guard(lambda: _ensure_collection(dimensions))


def _ensure_collection(dimensions: int) -> None:
    client = get_client()
    name = settings.QDRANT_COLLECTION
    if not client.collection_exists(name):
        client.create_collection(
            name,
            vectors_config=VectorParams(
                size=dimensions, distance=Distance.COSINE
            ),
        )
        return
    info = client.get_collection(name)
    size = info.config.params.vectors.size
    if int(size) != dimensions:
        raise VectorStoreError(
            "collection_mismatch",
            f"The existing collection stores {size}-dim vectors but the "
            f"current model produces {dimensions}-dim vectors.",
        )


def upsert(
    vectors: list[list[float]],
    payloads: list[dict[str, Any]],
    ids: list[str],
) -> int:
    return _guard(
        lambda: _upsert(vectors, payloads, ids)
    )


def _upsert(
    vectors: list[list[float]],
    payloads: list[dict[str, Any]],
    ids: list[str],
) -> int:
    points = [
        PointStruct(id=point_id, vector=vector, payload=payload)
        for point_id, vector, payload in zip(ids, vectors, payloads, strict=True)
    ]
    get_client().upsert(collection_name=settings.QDRANT_COLLECTION, points=points)
    return len(points)


def count() -> int:
    def run() -> int:
        client = get_client()
        if not client.collection_exists(settings.QDRANT_COLLECTION):
            return 0
        return client.count(
            collection_name=settings.QDRANT_COLLECTION, exact=True
        ).count

    return _guard(run)


def search(
    vector: list[float],
    limit: int,
    score_threshold: float | None = None,
    document_id: str | None = None,
) -> list[dict[str, Any]]:
    """Cosine similarity search. Scores are REAL Qdrant similarities."""

    def run() -> list[dict[str, Any]]:
        client = get_client()
        if not client.collection_exists(settings.QDRANT_COLLECTION):
            return []
        query_filter = None
        if document_id:
            query_filter = Filter(
                must=[
                    FieldCondition(
                        key="document_id", match=MatchValue(value=document_id)
                    )
                ]
            )
        hits = client.query_points(
            collection_name=settings.QDRANT_COLLECTION,
            query=vector,
            limit=limit,
            score_threshold=score_threshold,
            query_filter=query_filter,
            with_payload=True,
        ).points
        return [
            {"id": str(hit.id), "score": float(hit.score), **(hit.payload or {})}
            for hit in hits
        ]

    return _guard(run)


def scroll_points(limit: int = 100) -> list[dict[str, Any]]:
    def run() -> list[dict[str, Any]]:
        client = get_client()
        if not client.collection_exists(settings.QDRANT_COLLECTION):
            return []
        points, _ = client.scroll(
            collection_name=settings.QDRANT_COLLECTION,
            limit=limit,
            with_payload=True,
            with_vectors=False,
        )
        return [{"id": str(point.id), **(point.payload or {})} for point in points]

    return _guard(run)


def get_point(point_id_value: str) -> dict[str, Any]:
    def run() -> dict[str, Any]:
        points = get_client().retrieve(
            collection_name=settings.QDRANT_COLLECTION,
            ids=[point_id_value],
            with_payload=True,
            with_vectors=True,
        )
        if not points:
            raise VectorStoreError("not_found", "Vector not found.")
        point = points[0]
        vector = point.vector if isinstance(point.vector, list) else []
        return {"id": str(point.id), "vector": vector, **(point.payload or {})}

    return _guard(run)


def delete_document(document_id: str) -> None:
    _guard(lambda: _delete_document(document_id))


def _delete_document(document_id: str) -> None:
    client = get_client()
    if not client.collection_exists(settings.QDRANT_COLLECTION):
        return  # nothing indexed yet — deletion is idempotent
    client.delete(
        collection_name=settings.QDRANT_COLLECTION,
        points_selector=FilterSelector(
            filter=Filter(
                must=[
                    FieldCondition(
                        key="document_id", match=MatchValue(value=document_id)
                    )
                ]
            )
        ),
    )


def collection_info() -> dict[str, Any]:
    def run() -> dict[str, Any]:
        client = get_client()
        if not client.collection_exists(settings.QDRANT_COLLECTION):
            return {
                "collection": settings.QDRANT_COLLECTION,
                "vectors": 0,
                "dimensions": None,
                "distance": settings.QDRANT_DISTANCE,
            }
        info = client.get_collection(settings.QDRANT_COLLECTION)
        total = client.count(
            collection_name=settings.QDRANT_COLLECTION, exact=True
        ).count
        return {
            "collection": settings.QDRANT_COLLECTION,
            "vectors": int(total),
            "dimensions": int(info.config.params.vectors.size),
            "distance": settings.QDRANT_DISTANCE,
        }

    return _guard(run)


QUERY_POINT_ID = "__query__"


def semantic_space(
    query_vector: list[float] | None = None,
    dimensions: int = 2,
) -> dict[str, Any]:
    """Project stored vectors (and optionally a query vector) to 2D with PCA.

    Returns {"points": [...], "query": {x, y} | None}. The projection is a
    visualization, not the real vector space — retrieval scores always come
    from Qdrant itself, never from 2D distances.
    """

    def run() -> dict[str, Any]:
        import numpy as np

        client = get_client()
        rows: list[tuple[str, list[float], dict]] = []
        if client.collection_exists(settings.QDRANT_COLLECTION):
            points, _ = client.scroll(
                collection_name=settings.QDRANT_COLLECTION,
                limit=settings.SEMANTIC_SPACE_MAX_POINTS,
                with_payload=True,
                with_vectors=True,
            )
            rows = [
                (
                    str(point.id),
                    point.vector if isinstance(point.vector, list) else [],
                    point.payload or {},
                )
                for point in points
            ]
        if query_vector is not None:
            rows.append((QUERY_POINT_ID, list(query_vector), {}))
        if not rows:
            return {"points": [], "query": None}

        matrix = np.array([vector for _, vector, _ in rows], dtype=float)
        if matrix.ndim != 2 or matrix.shape[1] == 0:
            return {"points": [], "query": None}
        centered = matrix - matrix.mean(axis=0)
        try:
            _, _, rotation = np.linalg.svd(centered, full_matrices=False)
            projected = centered @ rotation[:dimensions].T
        except np.linalg.LinAlgError:
            projected = np.zeros((matrix.shape[0], dimensions))
        # With fewer points than requested dimensions there are fewer real
        # principal components; pad the rest with zeros so indexing is safe.
        if projected.shape[1] < dimensions:
            pad = np.zeros((projected.shape[0], dimensions - projected.shape[1]))
            projected = np.concatenate([projected, pad], axis=1)
        span = projected.max(axis=0) - projected.min(axis=0)
        span[span == 0] = 1.0
        normalized = (projected - projected.min(axis=0)) / span * 2.0 - 1.0

        space: list[dict[str, Any]] = []
        query_point: dict[str, Any] | None = None
        for index, (point_id, _, payload) in enumerate(rows):
            entry = {
                "x": round(float(normalized[index][0]), 4),
                "y": round(float(normalized[index][1]), 4)
                if dimensions > 1
                else 0.0,
            }
            if point_id == QUERY_POINT_ID:
                query_point = entry
                continue
            space.append(
                {
                    "point_id": point_id,
                    **entry,
                    "document_id": payload.get("document_id", ""),
                    "document_name": payload.get("document_name", ""),
                    "chunk_index": payload.get("chunk_index", index),
                    "page_start": payload.get("page_start", 0),
                }
            )
        return {"points": space, "query": query_point}

    return _guard(run)


def health() -> bool:
    try:
        get_client().get_collections()
        return True
    except Exception:  # noqa: BLE001
        return False


def _guard(run):  # noqa: ANN001, ANN202 - wrap qdrant errors in domain errors
    try:
        return run()
    except VectorStoreError:
        raise
    except Exception as error:  # noqa: BLE001
        if "not found" in str(error).lower():
            raise VectorStoreError("not_found", "Vector not found.") from error
        raise VectorStoreError(
            "vector_store_unavailable",
            "Qdrant is not reachable. Start it with docker compose up -d.",
        ) from error
