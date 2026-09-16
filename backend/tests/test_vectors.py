from __future__ import annotations

import uuid

from .conftest import LOREM_SENTENCE


def ingest_doc(client, sentences: int = 240) -> dict:
    content = " ".join([LOREM_SENTENCE] * sentences).encode("utf-8")
    response = client.post(
        "/api/documents/ingest",
        files={"file": ("vectors.txt", content, "text/plain")},
        data={"chunk_size": "512", "chunk_overlap": "100"},
    )
    assert response.status_code == 200
    return response.json()


class TestVectorLifecycle:
    def test_indexed_after_ingest(self, client):
        doc = ingest_doc(client)
        status = client.get("/api/vectors/status").json()
        assert status["connected"] is True
        assert status["distance"] == "Cosine"
        assert status["dimensions"] == 16
        assert status["vectors"] == doc["chunkCount"] > 0

    def test_points_browsable_with_payload(self, client):
        doc = ingest_doc(client)
        points = client.get("/api/vectors/points").json()
        assert points["total"] == doc["chunkCount"]
        point = points["points"][0]
        assert point["documentId"] == doc["id"]
        assert point["documentName"] == "vectors.txt"
        assert point["pageStart"] == 1
        assert point["estimatedTokens"] > 0
        assert uuid.UUID(point["id"])

    def test_point_detail_returns_vector(self, client):
        doc = ingest_doc(client)
        points = client.get("/api/vectors/points").json()["points"]
        detail = client.get(f"/api/vectors/points/{points[0]['id']}").json()
        assert len(detail["vector"]) == 16
        assert detail["dimensions"] == 16
        assert detail["text"].startswith("The approval process")

    def test_unknown_point_404(self, client):
        ingest_doc(client)
        response = client.get(f"/api/vectors/points/{uuid.uuid4()}")
        assert response.status_code == 404
        assert response.json()["detail"]["code"] == "not_found"

    def test_stats(self, client):
        doc = ingest_doc(client)
        stats = client.get("/api/vectors/stats").json()
        assert stats["vectors"] == doc["chunkCount"]
        assert stats["documents"] == 1
        assert stats["totalChunks"] == doc["chunkCount"]
        assert stats["embeddedChunks"] == doc["chunkCount"]
        assert stats["indexedPercent"] == 100
        assert stats["averageChunksPerDocument"] == float(doc["chunkCount"])

    def test_semantic_space_projection(self, client):
        ingest_doc(client)
        space = client.get("/api/vectors/semantic-space").json()
        assert space["method"] == "PCA"
        assert space["dimensions"] == 2
        assert len(space["points"]) >= 2
        for point in space["points"]:
            assert -1.0 <= point["x"] <= 1.0
            assert -1.0 <= point["y"] <= 1.0
            assert point["documentName"] == "vectors.txt"

    def test_delete_document_removes_vectors(self, client):
        doc = ingest_doc(client)
        assert client.get("/api/vectors/status").json()["vectors"] > 0
        client.delete(f"/api/documents/{doc['id']}")
        assert client.get("/api/vectors/status").json()["vectors"] == 0

    def test_delete_vectors_only(self, client):
        doc = ingest_doc(client)
        response = client.delete(f"/api/vectors/document/{doc['id']}")
        assert response.status_code == 200
        assert client.get("/api/vectors/status").json()["vectors"] == 0
        # document itself still exists
        assert client.get(f"/api/documents/{doc['id']}").status_code == 200

    def test_reindex_keeps_single_copy(self, client):
        doc = ingest_doc(client)
        expected = doc["chunkCount"]
        retry = client.post(f"/api/documents/{doc['id']}/embed")
        assert retry.status_code == 200
        assert client.get("/api/vectors/status").json()["vectors"] == expected


class TestQdrantUnavailable:
    def test_status_and_errors(self, client, monkeypatch):
        from app import settings
        from app.services import vector_store_service

        monkeypatch.setattr(settings, "QDRANT_URL", "http://127.0.0.1:9")
        vector_store_service.reset_client_for_tests()

        status = client.get("/api/vectors/status").json()
        assert status["connected"] is False
        assert status["errorCode"] == "vector_store_unavailable"

        stats = client.get("/api/vectors/stats")
        assert stats.status_code == 503
        assert stats.json()["detail"]["code"] == "vector_store_unavailable"

        points = client.get("/api/vectors/points")
        assert points.status_code == 503

        health = client.get("/api/health").json()
        assert health["qdrant"] == "unavailable"
        vector_store_service.reset_client_for_tests()


class TestFailureAndRetry:
    def test_embedding_failure_marks_error_and_retry_recovers(
        self, client, monkeypatch
    ):
        doc = ingest_doc(client)
        doc_id = doc["id"]
        assert client.get(f"/api/documents/{doc_id}").json()["status"] == "ready"

        # Corrupt the stored record to simulate a failed embedding stage.
        from app.services import document_service

        stored = document_service.get_document(doc_id)
        stored.status = "error"
        stored.error_code = "embedding_failed"
        stored.embedding_count = 0
        document_service.save_document(stored)

        failed = client.get(f"/api/documents/{doc_id}").json()
        assert failed["status"] == "error"
        assert failed["errorCode"] == "embedding_failed"

        retry = client.post(f"/api/documents/{doc_id}/embed")
        assert retry.status_code == 200
        recovered = client.get(f"/api/documents/{doc_id}").json()
        assert recovered["status"] == "ready"
        assert recovered["embeddingCount"] == doc["chunkCount"]
        assert recovered["errorCode"] == ""


class TestCollectionSafety:
    def test_dimension_mismatch_reported(self, monkeypatch):
        from app import settings
        from app.services import vector_store_service
        from app.services.vector_store_service import VectorStoreError

        monkeypatch.setattr(settings, "QDRANT_URL", ":memory:")
        monkeypatch.setattr(settings, "QDRANT_COLLECTION", f"mismatch_{uuid.uuid4().hex[:6]}")
        vector_store_service.reset_client_for_tests()
        vector_store_service.ensure_collection(16)
        try:
            vector_store_service.ensure_collection(8)
            raised = False
        except VectorStoreError as error:
            raised = True
            assert error.code == "collection_mismatch"
        assert raised
        vector_store_service.reset_client_for_tests()
