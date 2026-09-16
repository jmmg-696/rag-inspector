from __future__ import annotations

import uuid

from .conftest import LOREM_SENTENCE


def upload(client, content: bytes, filename: str):
    return client.post(
        "/api/documents/ingest",
        files={"file": (filename, content, "application/octet-stream")},
        data={"chunk_size": "512", "chunk_overlap": "100"},
    )


def ingest_doc(client, sentences: int = 300) -> dict:
    content = " ".join([LOREM_SENTENCE] * sentences).encode("utf-8")
    return upload(client, content, "embed-me.txt").json()


class TestEmbeddingModel:
    def test_metadata(self, client):
        body = client.get("/api/embeddings/model").json()
        assert body["model"] == "BAAI/bge-m3"
        assert body["provider"] == "Local"
        assert body["device"] in {"cpu", "cuda"}
        assert body["dimensions"] == 16
        assert body["status"] == "ready"


class TestEmbeddingPreview:
    def test_preview_for_chunk(self, client):
        doc = ingest_doc(client)
        response = client.post(
            "/api/embeddings/preview",
            json={"documentId": doc["id"], "chunkIndex": 1},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "ready"
        assert body["documentId"] == doc["id"]
        assert body["chunkId"] == "chunk-1"
        assert body["dimensions"] == 16
        assert len(body["vectorPreview"]) == 4
        assert uuid.UUID(body["pointId"])  # valid deterministic uuid

    def test_preview_is_deterministic(self, client):
        doc = ingest_doc(client)
        calls = [
            client.post(
                "/api/embeddings/preview",
                json={"documentId": doc["id"], "chunkIndex": 0},
            ).json()
            for _ in range(2)
        ]
        assert calls[0]["vectorPreview"] == calls[1]["vectorPreview"]
        assert calls[0]["pointId"] == calls[1]["pointId"]

    def test_preview_out_of_range(self, client):
        doc = ingest_doc(client, sentences=60)
        response = client.post(
            "/api/embeddings/preview",
            json={"documentId": doc["id"], "chunkIndex": 9999},
        )
        assert response.status_code == 404

    def test_preview_unknown_document(self, client):
        response = client.post(
            "/api/embeddings/preview",
            json={"documentId": "doc-aaaaaaaaaa", "chunkIndex": 0},
        )
        assert response.status_code == 404


class TestQueryEmbedding:
    def test_query(self, client):
        response = client.post("/api/embeddings/query", json={"text": "approval"})
        assert response.status_code == 200
        assert response.json()["dimensions"] == 16


class TestPointIds:
    def test_version_change_changes_ids(self):
        first = self._id("512:100")
        second = self._id("256:64")
        assert first != second
        assert first == self._id("512:100")  # stable for same version

    @staticmethod
    def _id(version: str) -> str:
        from app.services import vector_store_service

        return vector_store_service.point_id("doc-abc", version, 42)

    def test_fake_embedder_is_deterministic(self):
        from app.services import embedding_service

        one = embedding_service.encode_one("same text")
        two = embedding_service.encode_one("same text")
        other = embedding_service.encode_one("different text")
        assert one == two
        assert one != other
