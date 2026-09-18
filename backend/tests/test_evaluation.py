from __future__ import annotations

import json
from typing import Any

import pytest

from .conftest import LOREM_SENTENCE
from .test_generation import OTHER_SENTENCE

TRAINING_ANCHOR = "Employees complete security training once every quarter"


@pytest.fixture
def eval_dir(tmp_path, monkeypatch):
    """A mini dataset resolved against a corpus we control in tests."""
    dataset = {
        "name": "Mini Eval",
        "document": "mini.txt",
        "cases": [
            {
                "id": "m01",
                "question": "Who reviews requests?",
                "anchor": "review from the responsible area",
                "reference_answer": "The responsible area reviews requests.",
            },
            {
                "id": "m02",
                "question": "How often is security training?",
                "anchor": TRAINING_ANCHOR,
                "reference_answer": "Once every quarter.",
            },
            {
                "id": "m03",
                "question": "What about missing anchors?",
                "anchor": "THIS PHRASE IS NOWHERE IN THE DOCUMENT",
                "tags": ["negative"],
            },
        ],
    }
    path = tmp_path / "mini.json"
    path.write_text(json.dumps(dataset), encoding="utf-8")
    monkeypatch.setattr(
        "app.services.evaluation_service.settings.evaluation_dir",
        lambda: tmp_path,
    )
    return "mini.json"


@pytest.fixture
def mini_corpus(client):
    text = " ".join([LOREM_SENTENCE] * 30) + " " + " ".join(
        [OTHER_SENTENCE] * 30
    )
    response = client.post(
        "/api/documents/ingest",
        files={"file": ("mini.txt", text.encode("utf-8"), "text/plain")},
        data={"chunk_size": "128", "chunk_overlap": "16"},
    )
    assert response.status_code == 200
    doc = response.json()
    assert doc["status"] in {"embedding", "ready"}
    return doc


class TestDataset:
    def test_bundled_dataset_loads(self, client):
        body = client.get("/api/evaluation/dataset").json()
        assert body["name"] == "Sample Handbook"
        assert body["totalCases"] == 15
        assert body["document"] == "sample-handbook.txt"
        first = body["cases"][0]
        assert first["anchor"]
        assert first["referenceAnswer"]

    def test_unknown_dataset_404(self, client):
        response = client.get("/api/evaluation/dataset", params={"name": "nope.json"})
        assert response.status_code == 404
        assert response.json()["detail"]["code"] == "dataset_not_found"

    def test_malformed_dataset_rejected(self, tmp_path, monkeypatch):
        from app.services import evaluation_service

        (tmp_path / "bad.json").write_text('{"cases": [{"id": "x"}]}', "utf-8")
        monkeypatch.setattr(evaluation_service.settings, "evaluation_dir", lambda: tmp_path)
        with pytest.raises(evaluation_service.EvaluationError) as info:
            evaluation_service.load_dataset("bad.json")
        assert info.value.code == "dataset_invalid"


class TestMetricFormulas:
    """score_case is pure — exact expected values by definition."""

    def test_hit_at_first_rank(self):
        from app.services.evaluation_service import score_case

        metrics = score_case(
            [{"chunk_id": "chunk-4"}],
            [{"chunk_id": "chunk-4", "rank": 1}],
            top_k=5,
        )
        assert metrics["hit_at_k"] is True
        assert metrics["recall_at_k"] == 1.0
        assert metrics["precision_at_k"] == 0.2  # 1/5, denominator is K
        assert metrics["reciprocal_rank"] == 1.0

    def test_partial_recall_multiple_expected(self):
        from app.services.evaluation_service import score_case

        expected = [{"chunk_id": f"chunk-{i}"} for i in (1, 2, 3)]
        retrieved = [
            {"chunk_id": "chunk-9", "rank": 1},
            {"chunk_id": "chunk-2", "rank": 2},
            {"chunk_id": "chunk-3", "rank": 3},
        ]
        metrics = score_case(expected, retrieved, top_k=5)
        assert metrics["recall_at_k"] == round(2 / 3, 4)
        assert metrics["precision_at_k"] == 0.4  # 2/5
        assert metrics["reciprocal_rank"] == 0.5  # first relevant at #2

    def test_no_relevant_result(self):
        from app.services.evaluation_service import score_case

        metrics = score_case(
            [{"chunk_id": "chunk-1"}],
            [{"chunk_id": "chunk-7", "rank": 1}],
            top_k=3,
        )
        assert metrics["hit_at_k"] is False
        assert metrics["recall_at_k"] == 0.0
        assert metrics["reciprocal_rank"] == 0.0

    def test_fewer_results_than_k(self):
        from app.services.evaluation_service import score_case

        metrics = score_case(
            [{"chunk_id": "chunk-1"}],
            [{"chunk_id": "chunk-1", "rank": 1}],
            top_k=10,
        )
        assert metrics["precision_at_k"] == 0.1  # 1/10 — documented convention

    def test_cross_document_chunk_id_collision_not_relevant(self):
        """chunk-1 in doc B must not count as chunk-1 expected in doc A."""
        from app.services.evaluation_service import score_case

        metrics = score_case(
            [{"chunk_id": "chunk-1", "document_id": "doc-A"}],
            [{"chunk_id": "chunk-1", "document_id": "doc-B", "rank": 1}],
            top_k=5,
        )
        assert metrics["hit_at_k"] is False
        assert metrics["recall_at_k"] == 0.0

    def test_scoped_duplicate_ids_count_separately(self):
        from app.services.evaluation_service import score_case

        metrics = score_case(
            [
                {"chunk_id": "chunk-1", "document_id": "doc-A"},
                {"chunk_id": "chunk-1", "document_id": "doc-B"},
            ],
            [
                {"chunk_id": "chunk-1", "document_id": "doc-A", "rank": 1},
                {"chunk_id": "chunk-1", "document_id": "doc-B", "rank": 2},
            ],
            top_k=5,
        )
        assert metrics["recall_at_k"] == 1.0

    def test_aggregate_mrr(self):
        from app.services.evaluation_service import aggregate

        combined = aggregate(
            [
                {"hit_at_k": True, "recall_at_k": 1.0, "precision_at_k": 0.2, "reciprocal_rank": 1.0},
                {"hit_at_k": False, "recall_at_k": 0.0, "precision_at_k": 0.0, "reciprocal_rank": 0.0},
            ]
        )
        assert combined["hit_rate_at_k"] == 0.5
        assert combined["mrr"] == 0.5


class TestEvaluationRun:
    def test_retrieval_only_run_skips_unresolvable(self, client, mini_corpus, eval_dir):
        response = client.post(
            "/api/evaluation/run",
            json={"dataset": eval_dir, "topK": 5},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["dataset"]["totalCases"] == 3
        assert body["dataset"]["evaluatedCases"] == 2
        assert body["dataset"]["skippedCases"] == 1
        assert body["warnings"][0]["questionId"] == "m03"
        rm = body["retrievalMetrics"]
        for key in ("hitRateAtK", "recallAtK", "precisionAtK", "mrr"):
            assert 0.0 <= rm[key] <= 1.0
        assert body["generationMetrics"] is None
        # per-case detail with relevant flags (neutral ground truth)
        m01 = [c for c in body["cases"] if c["questionId"] == "m01"][0]
        assert m01["skipped"] is False
        assert m01["expectedSources"]
        assert any(hit["relevant"] for hit in m01["retrieved"]) is True
        assert m01["metrics"]["hitAtK"] is True

    def test_deterministic_metrics(self, client, mini_corpus, eval_dir):
        first = client.post("/api/evaluation/run", json={"dataset": eval_dir, "topK": 5}).json()
        second = client.post("/api/evaluation/run", json={"dataset": eval_dir, "topK": 5}).json()
        assert first["retrievalMetrics"] == second["retrievalMetrics"]
        assert first["runId"] != second["runId"]

    def test_configuration_recorded(self, client, mini_corpus, eval_dir):
        body = client.post(
            "/api/evaluation/run", json={"dataset": eval_dir, "topK": 3, "scoreThreshold": 0.1}
        ).json()
        config = body["configuration"]
        assert config["topK"] == 3
        assert config["scoreThreshold"] == 0.1
        assert config["embeddingModel"] == "BAAI/bge-m3"
        assert config["generationEnabled"] is False
        assert config["chunkSize"] == 128
        assert config["chunkOverlap"] == 16
        assert config["documentName"] == "mini.txt"

    def test_missing_corpus_document_blocks_run(self, client, eval_dir):
        response = client.post("/api/evaluation/run", json={"dataset": eval_dir})
        assert response.status_code == 409
        assert response.json()["detail"]["code"] == "evaluation_document_missing"

    def test_topk_propagates(self, client, mini_corpus, eval_dir):
        body = client.post(
            "/api/evaluation/run", json={"dataset": eval_dir, "topK": 1}
        ).json()
        m01 = [c for c in body["cases"] if c["questionId"] == "m01"][0]
        assert len(m01["retrieved"]) <= 1

    def test_threshold_propagates(self, client, mini_corpus, eval_dir):
        body = client.post(
            "/api/evaluation/run",
            json={"dataset": eval_dir, "topK": 5, "scoreThreshold": 0.9999},
        ).json()
        m01 = [c for c in body["cases"] if c["questionId"] == "m01"][0]
        assert m01["retrieved"] == []
        assert m01["metrics"]["hitAtK"] is False  # measured, not hidden


class TestGenerationEvaluation:
    def _patch(self, monkeypatch):
        from app.services import ollama_service

        def fake_generate(model, prompt, temperature):
            return {
                "response": (
                    "Answer grounded in the context [SOURCE_1] "
                    "plus rumor [SOURCE_9]."
                ),
                "metrics": {
                    "elapsedMs": 500,
                    "completionTokens": 12,
                    "promptTokens": 400,
                    "tokensPerSecond": 24.0,
                },
            }

        monkeypatch.setattr(ollama_service, "generate", fake_generate)
        monkeypatch.setattr(ollama_service, "ensure_model", lambda model: None)
        monkeypatch.setattr(
            ollama_service, "list_models", lambda: ["fake-model:test"]
        )

    def test_disabled_never_calls_llm(self, client, mini_corpus, eval_dir, monkeypatch):
        from app.services import ollama_service

        def explode(*args, **kwargs):
            raise AssertionError("LLM must not be called when generation is off")

        monkeypatch.setattr(ollama_service, "generate", explode)
        body = client.post(
            "/api/evaluation/run", json={"dataset": eval_dir, "topK": 3}
        ).json()
        assert body["generationMetrics"] is None
        assert all(case["generation"] is None for case in body["cases"])

    def test_citation_coverage_and_validity(self, client, mini_corpus, eval_dir, monkeypatch):
        self._patch(monkeypatch)
        body = client.post(
            "/api/evaluation/run",
            json={"dataset": eval_dir, "topK": 3, "generateAnswers": True},
        ).json()
        gm = body["generationMetrics"]
        assert gm["generatedAnswers"] == 2
        assert gm["citationCoverage"] == 1.0  # every answer cites SOURCE_1
        # 1 valid + 1 invalid per answer → 1/2
        assert gm["validCitationRate"] == 0.5
        assert gm["avgGenerationMs"] == 500
        evaluated = [c for c in body["cases"] if not c["skipped"]]
        for case in evaluated:
            assert case["generation"]["verifiedCitations"] == ["SOURCE_1"]
            assert case["generation"]["unresolvedCitations"] == [9]
        assert body["configuration"]["llmModel"] == "fake-model:test"

    def test_llm_failure_per_case_not_run_crash(
        self, client, mini_corpus, eval_dir, monkeypatch
    ):
        from app.services import ollama_service
        from app.services.ollama_service import OllamaError

        def fail(model, prompt, temperature):
            raise OllamaError("llm_unavailable", "Ollama down")

        monkeypatch.setattr(ollama_service, "generate", fail)
        monkeypatch.setattr(ollama_service, "ensure_model", lambda model: None)
        monkeypatch.setattr(
            ollama_service, "list_models", lambda: ["fake-model:test"]
        )
        response = client.post(
            "/api/evaluation/run",
            json={"dataset": eval_dir, "topK": 3, "generateAnswers": True},
        )
        assert response.status_code == 200
        body = response.json()
        evaluated = [c for c in body["cases"] if not c["skipped"]]
        assert all(
            c["generation"]["errorCode"] == "llm_unavailable" for c in evaluated
        )
        # retrieval metrics still computed — independent of the LLM
        assert body["retrievalMetrics"]["hitRateAtK"] >= 0.0
        assert body["generationMetrics"]["generatedAnswers"] == 0
        assert body["generationMetrics"]["failedAnswers"] == 2


class TestRealDatasetValidation:
    def test_bundled_dataset_against_synthetic_corpus_skips_all(
        self, client, mini_corpus
    ):
        """sample-handbook dataset vs mini corpus: document name mismatch."""
        response = client.post("/api/evaluation/run", json={})
        assert response.status_code == 409
        assert response.json()["detail"]["code"] == "evaluation_document_missing"
