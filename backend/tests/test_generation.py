from __future__ import annotations

import json
from typing import Any

import pytest

from .conftest import LOREM_SENTENCE

OTHER_SENTENCE = "Employees complete security training once every quarter."


def upload(client, text: str, filename: str) -> dict:
    response = client.post(
        "/api/documents/ingest",
        files={"file": (filename, text.encode("utf-8"), "text/plain")},
        data={"chunk_size": "128", "chunk_overlap": "16"},
    )
    assert response.status_code == 200
    return response.json()


@pytest.fixture
def corpus(client):
    doc_a = upload(
        client, " ".join([LOREM_SENTENCE] * 60), "approval.txt"
    )
    doc_b = upload(client, " ".join([OTHER_SENTENCE] * 40), "training.txt")
    return doc_a, doc_b


def fake_answer(_model: str, _prompt: str, _temperature: float) -> dict[str, Any]:
    return {
        "response": (
            "The responsible area must review each request [SOURCE_1]. "
            "Approvals follow roles [SOURCE_2]. Rumor says [SOURCE_9]."
        ),
        "metrics": {
            "elapsedMs": 42,
            "completionTokens": 30,
            "promptTokens": 90,
            "tokensPerSecond": 7.5,
        },
    }


def patch_ollama(monkeypatch, generate_impl=None, ensure_impl=None):
    from app.services import ollama_service

    monkeypatch.setattr(
        ollama_service,
        "generate",
        generate_impl or fake_answer,
    )
    monkeypatch.setattr(
        ollama_service,
        "ensure_model",
        ensure_impl or (lambda model: None),
    )
    monkeypatch.setattr(
        ollama_service,
        "list_models",
        lambda: ["fake-model:test", "other:1b"],
    )


def hits(n: int, tokens: int) -> list[dict[str, Any]]:
    return [
        {
            "document_id": f"doc-{i}",
            "document_name": f"doc{i}.txt",
            "chunk_id": f"chunk-{i}",
            "chunk_index": i,
            "page_start": 1,
            "page_end": 1,
            "score": 0.9 - i / 100,
            "estimated_tokens": tokens,
            "text": f"chunk text {i}",
        }
        for i in range(n)
    ]


class TestOllamaServiceUnit:
    def test_list_models_unavailable(self):
        from app.services.ollama_service import OllamaError, list_models

        with pytest.raises(OllamaError) as info:
            list_models()
        assert info.value.code == "llm_unavailable"

    def test_status_reports_configured_model(self):
        from app.services import ollama_service

        state = ollama_service.status()
        assert state["available"] is False
        assert state["configured_model"] == "fake-model:test"
        assert state["model_available"] is False

    def test_generate_timeout_maps_to_stable_error(self, monkeypatch):
        import httpx
        from app.services import ollama_service

        class TimingClient(httpx.Client):
            def post(self, *args, **kwargs):  # noqa: ANN002, ANN003
                raise httpx.TimeoutException("boom")

        monkeypatch.setattr(
            ollama_service, "_client", lambda timeout: TimingClient()
        )
        with pytest.raises(ollama_service.OllamaError) as info:
            ollama_service.generate("m", "p", 0.2)
        assert info.value.code == "llm_timeout"


class TestContextService:
    def test_budget_prefers_whole_chunks_in_rank_order(self):
        from app.services import context_service

        result = context_service.build_context(hits(4, 3000), max_context_tokens=4000)
        assert result.retrieved_chunks == 4
        assert result.included_chunks == 1
        assert result.blocks[0].source_id == "SOURCE_1"

    def test_budget_fills_with_smaller_later_chunks(self):
        from app.services import context_service

        big = hits(1, 3000)
        small = [
            {**h, "estimated_tokens": 500}
            for h in hits(3, 500)
        ]
        result = context_service.build_context(
            big + small, max_context_tokens=4000
        )
        assert result.included_chunks == 3  # 3000 + 500 + 500

    def test_source_ids_are_rank_ordered(self):
        from app.services import context_service

        result = context_service.build_context(hits(3, 10))
        assert [b.source_id for b in result.blocks] == [
            "SOURCE_1",
            "SOURCE_2",
            "SOURCE_3",
        ]
        assert "SOURCE_2" in result.text()
        assert "Document: doc1.txt" in result.text()


class TestPromptService:
    def test_prompt_structure(self):
        from app.services import context_service, prompt_service

        context = context_service.build_context(hits(2, 10))
        prompt = prompt_service.build_prompt(context, "What is approval?")
        assert "Do not invent" in prompt["system"]
        assert "[SOURCE_1]" in prompt["system"]  # citation rule shown
        assert "[SOURCE_1]" in prompt["context"]
        assert "Document:" in prompt["context"]
        assert "What is approval?" in prompt["user"]
        for section in ("system", "context", "user"):
            assert prompt[section] in prompt["full_prompt"]

    def test_system_prompt_env_override(self, monkeypatch):
        from app import settings
        from app.services import context_service, prompt_service

        monkeypatch.setattr(settings, "RAG_SYSTEM_PROMPT", "Custom rules.")
        prompt = prompt_service.build_prompt(
            context_service.build_context(hits(1, 10)), "q"
        )
        assert prompt["system"] == "Custom rules."
        assert prompt["full_prompt"].startswith("Custom rules.")


class TestCitationParsing:
    def test_valid_invalid_multiple_none(self):
        from app.services import context_service, generation_service

        blocks = context_service.build_context(hits(4, 10)).blocks
        verified, unresolved = generation_service.parse_citations(
            "A [SOURCE_1] B [SOURCE_3] and [SOURCE_9].", blocks
        )
        assert verified == ["SOURCE_1", "SOURCE_3"]
        assert unresolved == [9]

        verified, unresolved = generation_service.parse_citations(
            "no citations here", blocks
        )
        assert verified == []
        assert unresolved == []


class TestGenerationEndpoint:
    def _generate(self, client, **extra):
        body = {"query": "approval", "topK": 3, **extra}
        return client.post("/api/generation/generate", json=body)

    def test_full_flow(self, client, corpus, monkeypatch):
        patch_ollama(monkeypatch)
        response = self._generate(client)
        assert response.status_code == 200
        body = response.json()
        assert body["model"] == "fake-model:test"
        assert body["temperature"] == 0.2
        assert body["retrieval"]["topK"] == 3
        assert body["retrieval"]["totalResults"] >= 1
        assert body["retrieval"]["retrievalMs"] >= 0
        assert body["context"]["retrievedChunks"] == body["retrieval"]["totalResults"]
        assert body["context"]["includedChunks"] >= 1
        assert body["context"]["sources"][0]["sourceId"] == "SOURCE_1"
        assert "[SOURCE_1]" in body["prompt"]["fullPrompt"]
        assert body["answer"].startswith("The responsible area")
        assert body["citations"]["verified"] == ["SOURCE_1", "SOURCE_2"]
        assert body["citations"]["unresolved"] == [9]
        assert body["generationMetrics"]["completionTokens"] == 30

    def test_no_indexed_documents_never_calls_llm(
        self, client, monkeypatch
    ):
        calls: list[str] = []
        patch_ollama(
            monkeypatch,
            generate_impl=lambda *a, **k: calls.append("gen") or fake_answer(*a, **k),
        )
        response = self._generate(client)
        assert response.status_code == 409
        assert response.json()["detail"]["code"] == "no_indexed_documents"
        assert calls == []

    def test_empty_retrieval_skips_llm_without_error(self, client, corpus, monkeypatch):
        patch_ollama(monkeypatch)
        response = self._generate(client, scoreThreshold=0.9999)
        assert response.status_code == 200
        body = response.json()
        assert body["answer"] is None
        assert body["context"]["retrievedChunks"] == 0

    def test_model_missing_propagates_404(self, client, corpus, monkeypatch):
        from app.services.ollama_service import OllamaError

        def missing(model):
            raise OllamaError("llm_model_not_found", f"no {model}")

        patch_ollama(monkeypatch, ensure_impl=missing)
        response = self._generate(client, model="ghost:7b")
        assert response.status_code == 404
        assert response.json()["detail"]["code"] == "llm_model_not_found"

    def test_document_filter_and_threshold_propagate(
        self, client, corpus, monkeypatch
    ):
        patch_ollama(monkeypatch)
        doc_b = corpus[1]
        response = self._generate(
            client, documentId=doc_b["id"], topK=20, scoreThreshold=0.3
        )
        body = response.json()
        assert body["retrieval"]["filteredDocumentId"] == doc_b["id"]
        for hit in body["retrieval"]["results"]:
            assert hit["documentId"] == doc_b["id"]
            assert hit["score"] >= 0.3

    def test_validation(self, client, corpus):
        assert self._generate(client, topK=0).status_code == 422
        assert self._generate(client, temperature=3).status_code == 422
        assert self._generate(client, query="").status_code == 422

    def test_generation_error_maps_stably(self, client, corpus, monkeypatch):
        from app.services.ollama_service import OllamaError

        def fail(*args, **kwargs):
            raise OllamaError("llm_unavailable", "down")

        patch_ollama(monkeypatch, generate_impl=fail)
        response = self._generate(client)
        assert response.status_code == 503
        assert response.json()["detail"]["code"] == "llm_unavailable"


class TestStreamEndpoint:
    def _events(self, client, body: dict) -> list[dict]:
        response = client.post("/api/generation/stream", json=body)
        assert response.status_code == 200
        return [json.loads(line) for line in response.text.splitlines() if line]

    def test_stage_sequence_is_real(self, client, corpus, monkeypatch):
        from app.services import ollama_service

        def fake_stream(model, prompt, temperature):
            yield "token", "The area must review [SOURCE_1]."
            yield "metrics", {"elapsedMs": 10, "completionTokens": 6}

        monkeypatch.setattr(ollama_service, "generate_stream", fake_stream)
        monkeypatch.setattr(ollama_service, "ensure_model", lambda m: None)
        monkeypatch.setattr(
            ollama_service, "list_models", lambda: ["fake-model:test"]
        )
        events = self._events(client, {"query": "approval", "topK": 3})
        stages = [e["stage"] for e in events if e["type"] == "stage"]
        assert stages == [
            "retrieving",
            "building_context",
            "building_prompt",
            "generating",
        ]
        assert any(e["type"] == "token" for e in events)
        final = [e for e in events if e["type"] == "result"][0]["payload"]
        assert final["answer"].endswith("[SOURCE_1].")
        assert final["citations"]["verified"] == ["SOURCE_1"]
        # the result payload must be schema-serialized (camelCase), same as
        # the non-streaming endpoint
        assert final["retrieval"]["topK"] == 3
        assert final["context"]["includedChunks"] >= 1
        assert final["generationMetrics"]["completionTokens"] == 6

    def test_stream_llm_timeout_event(self, client, corpus, monkeypatch):
        from app.services import ollama_service
        from app.services.ollama_service import OllamaError

        def timeout_stream(model, prompt, temperature):
            yield "token", "partial"
            raise OllamaError("llm_timeout", "too slow")
            yield  # pragma: no cover

        monkeypatch.setattr(ollama_service, "generate_stream", timeout_stream)
        monkeypatch.setattr(ollama_service, "ensure_model", lambda m: None)
        monkeypatch.setattr(
            ollama_service, "list_models", lambda: ["fake-model:test"]
        )
        events = self._events(client, {"query": "approval", "topK": 2})
        assert events[-1]["type"] == "error"
        assert events[-1]["code"] == "llm_timeout"

    def test_stream_no_documents_error(self, client, monkeypatch):
        events = self._events(client, {"query": "anything", "topK": 2})
        assert events[-1] == {
            "type": "error",
            "code": "no_indexed_documents",
            "message": "Upload and index a document before running RAG.",
        }


class TestLlmApi:
    def test_status_unavailable(self, client):
        body = client.get("/api/llm/status").json()
        assert body["available"] is False
        assert body["configuredModel"] == "fake-model:test"
        assert body["modelAvailable"] is False

    def test_status_available_after_patch(self, client, monkeypatch):
        from app.services import ollama_service

        monkeypatch.setattr(
            ollama_service, "list_models", lambda: ["fake-model:test"]
        )
        body = client.get("/api/llm/status").json()
        assert body["available"] is True
        assert body["modelAvailable"] is True
        assert body["models"] == ["fake-model:test"]

    def test_models_503_when_down(self, client):
        response = client.get("/api/llm/models")
        assert response.status_code == 503
        assert response.json()["detail"]["code"] == "llm_unavailable"


class TestHealthContract:
    def test_health_includes_ollama(self, client):
        body = client.get("/api/health").json()
        assert body["ollama"] == "unavailable"
        assert set(body) == {"api", "qdrant", "embedding_model", "ollama"}
