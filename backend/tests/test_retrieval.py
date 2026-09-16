from __future__ import annotations

import uuid

import pytest

from .conftest import LOREM_SENTENCE

APPROVAL_SENTENCE = (
    "The responsible area must review each request before approval."
)
TRAINING_SENTENCE = (
    "Employees complete security training once every quarter."
)


def upload(client, content: bytes, filename: str) -> dict:
    response = client.post(
        "/api/documents/ingest",
        files={"file": (filename, content, "application/octet-stream")},
        data={"chunk_size": "128", "chunk_overlap": "16"},
    )
    assert response.status_code == 200
    return response.json()


@pytest.fixture
def indexed(client):
    doc_a = upload(
        client,
        " ".join([APPROVAL_SENTENCE] * 60).encode("utf-8"),
        "approval.txt",
    )
    doc_b = upload(
        client,
        " ".join([TRAINING_SENTENCE] * 60).encode("utf-8"),
        "training.txt",
    )
    return doc_a, doc_b


def search(client, **body):
    payload = {"query": "approval", **body}
    return client.post("/api/retrieval/search", json=payload)


class TestSearch:
    def test_real_results_with_scores(self, client, indexed):
        response = search(client, topK=5)
        assert response.status_code == 200
        body = response.json()
        assert body["query"] == "approval"
        assert body["queryEmbedding"]["model"] == "BAAI/bge-m3"
        assert body["queryEmbedding"]["dimensions"] == 16
        assert body["queryEmbedding"]["vector"] is None  # not by default
        assert body["corpusSize"] == indexed[0]["chunkCount"] + indexed[1]["chunkCount"]
        assert 1 <= body["totalResults"] <= 5
        scores = [hit["score"] for hit in body["results"]]
        assert scores == sorted(scores, reverse=True)  # ordered desc
        assert [hit["rank"] for hit in body["results"]] == list(
            range(1, body["totalResults"] + 1)
        )
        first = body["results"][0]
        for field in (
            "pointId",
            "documentId",
            "documentName",
            "chunkIndex",
            "pageStart",
            "estimatedTokens",
            "text",
        ):
            assert field in first, field
        assert all(-1.0 <= score <= 1.0 for score in scores)  # cosine range

    def test_top_k_respected(self, client, indexed):
        all_results = search(client, topK=20).json()["totalResults"]
        limited = search(client, topK=2).json()["totalResults"]
        assert all_results > 2
        assert limited == 2

    def test_threshold_filters(self, client, indexed):
        body = search(client, topK=20, scoreThreshold=0.9999).json()
        assert body["totalResults"] == 0

    def test_document_filter(self, client, indexed):
        doc_a, _ = indexed
        body = search(client, topK=20, documentId=doc_a["id"]).json()
        assert body["totalResults"] > 0
        assert all(
            hit["documentId"] == doc_a["id"] for hit in body["results"]
        )
        assert all(
            hit["documentName"] == "approval.txt" for hit in body["results"]
        )

    def test_empty_query_rejected(self, client, indexed):
        assert search(client, query="").status_code == 422

    def test_top_k_bounds(self, client, indexed):
        assert search(client, topK=0).status_code == 422
        assert search(client, topK=50).status_code == 422

    def test_threshold_bounds(self, client, indexed):
        assert search(client, scoreThreshold=1.5).status_code == 422
        assert search(client, scoreThreshold=-0.2).status_code == 422

    def test_include_embedding(self, client, indexed):
        body = search(client, topK=3, includeEmbedding=True).json()
        vector = body["queryEmbedding"]["vector"]
        assert len(vector) == 16

    def test_no_results_is_legit(self, client, indexed):
        body = search(
            client, query="zzz", topK=20, scoreThreshold=0.999
        ).json()
        assert body["totalResults"] == 0
        assert body["results"] == []

    def test_empty_corpus(self, client):
        body = search(client, topK=5).json()
        assert body["results"] == []
        assert body["corpusSize"] == 0


class TestFailureModes:
    def test_embedding_failure_is_stable(self, client, indexed, monkeypatch):
        from app.services import embedding_service
        from app.services.embedding_service import EmbeddingError

        def fail(_text):
            raise EmbeddingError(
                "embedding_model_unavailable", "model could not load"
            )

        monkeypatch.setattr(embedding_service, "encode_one", fail)
        response = search(client)
        assert response.status_code == 503
        assert response.json()["detail"]["code"] == "embedding_model_unavailable"

    def test_qdrant_unavailable_is_stable(self, client, indexed, monkeypatch):
        from app import settings
        from app.services import vector_store_service

        monkeypatch.setattr(settings, "QDRANT_URL", "http://127.0.0.1:9")
        vector_store_service.reset_client_for_tests()
        response = search(client)
        assert response.status_code == 503
        assert response.json()["detail"]["code"] == "vector_store_unavailable"
        vector_store_service.reset_client_for_tests()


class TestRetrievalSpace:
    def test_query_point_and_highlights(self, client, indexed):
        response = client.post(
            "/api/retrieval/semantic-space",
            json={"query": "approval", "topK": 3},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["method"] == "PCA"
        assert body["dimensions"] == 2
        assert body["model"] == "BAAI/bge-m3"
        assert body["query"] is not None
        assert -1.0 <= body["query"]["x"] <= 1.0
        assert len(body["points"]) >= 2
        retrieved = [point for point in body["points"] if point["retrieved"]]
        assert 1 <= len(retrieved) <= 3
        for point in retrieved:
            assert point["score"] is not None
        non_retrieved = [p for p in body["points"] if not p["retrieved"]]
        assert all(p["score"] is None for p in non_retrieved)

    def test_scores_are_qdrant_scores_match_search(self, client, indexed):
        top = search(client, topK=3).json()["results"]
        space = client.post(
            "/api/retrieval/semantic-space",
            json={"query": "approval", "topK": 3},
        ).json()
        scores_space = {
            point["pointId"]: point["score"]
            for point in space["points"]
            if point["retrieved"]
        }
        scores_search = {hit["pointId"]: hit["score"] for hit in top}
        assert scores_space == scores_search

    def test_empty_corpus_still_projects_query(self, client):
        body = client.post(
            "/api/retrieval/semantic-space",
            json={"query": "anything"},
        ).json()
        assert body["points"] == []
        assert body["query"] is not None
