"""RAG evaluation (Phase 6).

Reuses retrieval_service (real Qdrant top-K) and generation_service (real
local Ollama) — this module adds measurement, not another pipeline.

Relevance ground truth comes ONLY from the evaluation dataset: expected
sources are text anchors resolved against the currently indexed chunks
(whitespace-normalized substring match). Similarity scores never decide
relevance, and no LLM judges anything.

Metrics — exact definitions:
  Hit Rate@K    = share of evaluated questions with >=1 expected source in
                  the returned top K.
  Recall@K      = per question: expected sources retrieved / expected
                  sources; averaged over evaluated questions.
  Precision@K   = per question: expected sources retrieved / K (always
                  divided by K, even when fewer results were returned).
  MRR           = average of 1/rank of the first expected source
                  (0 when none appears).
  Citation coverage / valid citation rate — see generation evaluation below;
  they describe references present in answers, never correctness.

Cases whose expected anchor resolves to no indexed chunk are SKIPPED with
a warning — never scored as failures.
"""

from __future__ import annotations

import json
import re
import uuid
from pathlib import Path
from typing import Any

from .. import settings
from . import (
    document_service,
    embedding_service,
    generation_service,
    retrieval_service,
)
from .embedding_service import EmbeddingError
from .generation_service import GenerationError
from .ollama_service import OllamaError
from .vector_store_service import VectorStoreError

DATASET_FILE = "sample-handbook.json"


class EvaluationError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def load_dataset(name: str = DATASET_FILE) -> dict[str, Any]:
    path = Path(settings.evaluation_dir()) / name
    if not path.exists():
        raise EvaluationError("dataset_not_found", f"Dataset {name} not found.")
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or "cases" not in data:
        raise EvaluationError("dataset_invalid", f"Dataset {name} is malformed.")
    for case in data["cases"]:
        if not case.get("id") or not case.get("question") or not case.get("anchor"):
            raise EvaluationError(
                "dataset_invalid",
                f"Dataset {name} has a case without id/question/anchor.",
            )
    return data


def list_datasets() -> list[str]:
    directory = Path(settings.evaluation_dir())
    if not directory.exists():
        return []
    return sorted(p.name for p in directory.glob("*.json"))


def _resolve_anchor(
    document: Any, anchor: str
) -> list[dict[str, Any]]:
    """All indexed chunks of the document containing the anchor."""
    needle = _normalize(anchor)
    chunks = document_service.chunks_for_pages(document)
    return [
        {
            "document_id": document.id,
            "chunk_id": chunk.id,
            "chunk_index": chunk.index,
            "page_start": chunk.page_start,
            "estimated_tokens": chunk.estimated_tokens,
        }
        for chunk in chunks
        if needle in _normalize(chunk.text)
    ]


def score_case(
    expected: list[dict[str, Any]], retrieved: list[dict[str, Any]], top_k: int
) -> dict[str, Any]:
    """Per-case metrics for one retrieval outcome. Pure and deterministic.

    Relevance is scoped by (document_id, chunk_id): chunk ids repeat
    across documents ("chunk-5" exists in every corpus document).
    """
    expected_ids = {
        (item.get("document_id", ""), item["chunk_id"]) for item in expected
    }
    relevant_ranks = [
        hit["rank"]
        for hit in retrieved
        if (hit.get("document_id", ""), hit["chunk_id"]) in expected_ids
    ]
    first_rank = min(relevant_ranks) if relevant_ranks else None
    hits = len(relevant_ranks)
    return {
        "hit_at_k": first_rank is not None,
        "recall_at_k": round(hits / len(expected), 4) if expected else 0.0,
        "precision_at_k": round(hits / top_k, 4),
        "reciprocal_rank": round(1.0 / first_rank, 4) if first_rank else 0.0,
        "first_relevant_rank": first_rank,
    }


def run_evaluation(
    top_k: int = 5,
    score_threshold: float = 0.0,
    dataset_name: str = DATASET_FILE,
    generate_answers: bool = False,
    model: str | None = None,
    temperature: float | None = None,
) -> dict[str, Any]:
    dataset = load_dataset(dataset_name)
    document_name = str(dataset.get("document", ""))
    documents = [
        doc for doc in document_service.list_documents() if doc.name == document_name
    ]
    if not documents:
        raise EvaluationError(
            "evaluation_document_missing",
            f"The dataset expects an indexed document named “{document_name}”. "
            "Upload and index it before running the evaluation.",
        )
    document = documents[0]

    cases_out: list[dict[str, Any]] = []
    evaluated: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []

    for case in dataset["cases"]:
        expected = _resolve_anchor(document, str(case["anchor"]))
        if not expected:
            warnings.append(
                {
                    "question_id": case["id"],
                    "message": (
                        "Expected source could not be resolved against the "
                        "current indexed corpus — case skipped from scoring."
                    ),
                }
            )
            cases_out.append(
                {
                    "question_id": case["id"],
                    "question": case["question"],
                    "tags": case.get("tags", []),
                    "reference_answer": case.get("reference_answer", ""),
                    "skipped": True,
                    "expected_sources": [],
                    "retrieved": [],
                    "metrics": None,
                    "generation": None,
                }
            )
            continue

        retrieval = retrieval_search(str(case["question"]), top_k, score_threshold)
        expected_ids = {
            (item["document_id"], item["chunk_id"]) for item in expected
        }
        retrieved = [
            {
                "rank": hit["rank"],
                "score": hit["score"],
                "chunk_id": hit["chunk_id"],
                "chunk_index": hit["chunk_index"],
                "page_start": hit["page_start"],
                "document_id": hit["document_id"],
                "document_name": hit["document_name"],
                "text": hit["text"][:500],
                "relevant": (hit["document_id"], hit["chunk_id"]) in expected_ids,
            }
            for hit in retrieval["results"]
        ]
        metrics = score_case(expected, retrieval["results"], top_k)
        generation: dict[str, Any] | None = None
        if generate_answers:
            generation = _evaluate_generation(
                str(case["question"]),
                top_k,
                score_threshold,
                model,
                temperature,
            )
        evaluated.append(metrics)
        cases_out.append(
            {
                "question_id": case["id"],
                "question": case["question"],
                "tags": case.get("tags", []),
                "reference_answer": case.get("reference_answer", ""),
                "skipped": False,
                "expected_sources": expected,
                "retrieved": retrieved,
                "metrics": metrics,
                "generation": generation,
            }
        )

    if not evaluated:
        raise EvaluationError(
            "evaluation_no_resolvable_cases",
            "No dataset case could be resolved against the current corpus.",
        )

    retrieval_metrics = aggregate(evaluated)
    generation_metrics = (
        aggregate_generation(cases_out) if generate_answers else None
    )

    meta = embedding_service.metadata()
    return {
        "run_id": f"eval-{uuid.uuid4().hex[:12]}",
        "created_at": utc_now_iso(),
        "dataset": {
            "name": str(dataset.get("name", dataset_name)),
            "total_cases": len(dataset["cases"]),
            "evaluated_cases": len(evaluated),
            "skipped_cases": len(dataset["cases"]) - len(evaluated),
        },
        "configuration": {
            "top_k": top_k,
            "score_threshold": score_threshold,
            "embedding_model": settings.EMBEDDING_MODEL_NAME,
            "embedding_dimensions": meta.get("dimensions"),
            "chunk_size": document.chunk_size,
            "chunk_overlap": document.chunk_overlap,
            "document_name": document.name,
            "generation_enabled": generate_answers,
            "llm_model": (model or settings.OLLAMA_MODEL) if generate_answers else None,
            "temperature": temperature,
        },
        "retrieval_metrics": retrieval_metrics,
        "generation_metrics": generation_metrics,
        "warnings": warnings,
        "cases": cases_out,
    }


def retrieval_search(query: str, top_k: int, score_threshold: float) -> dict[str, Any]:
    try:
        return retrieval_service.search(
            query=query, top_k=top_k, score_threshold=score_threshold
        )
    except (EmbeddingError, VectorStoreError) as error:
        raise EvaluationError(error.code, error.message) from error


def _evaluate_generation(
    question: str,
    top_k: int,
    score_threshold: float,
    model: str | None,
    temperature: float | None,
) -> dict[str, Any]:
    try:
        result = generation_service.run(
            query=question,
            top_k=top_k,
            score_threshold=score_threshold,
            model=model,
            temperature=temperature,
        )
    except (GenerationError, OllamaError) as error:
        return {"error_code": error.code, "error_message": error.message}
    answer = result["answer"] or ""
    total_detected = len(result["citations"]["verified"]) + len(
        result["citations"]["unresolved"]
    )
    return {
        "answer": answer,
        "verified_citations": result["citations"]["verified"],
        "unresolved_citations": result["citations"]["unresolved"],
        "total_citations_detected": total_detected,
        "model": result["model"],
        "metrics": result["generation_metrics"],
    }


def aggregate(metrics_list: list[dict[str, Any]]) -> dict[str, Any]:
    n = len(metrics_list)
    hit = sum(1 for m in metrics_list if m["hit_at_k"]) / n
    recall = sum(m["recall_at_k"] for m in metrics_list) / n
    precision = sum(m["precision_at_k"] for m in metrics_list) / n
    mrr = sum(m["reciprocal_rank"] for m in metrics_list) / n
    return {
        "hit_rate_at_k": round(hit, 4),
        "recall_at_k": round(recall, 4),
        "precision_at_k": round(precision, 4),
        "mrr": round(mrr, 4),
    }


def aggregate_generation(cases: list[dict[str, Any]]) -> dict[str, Any]:
    generated = [
        case["generation"]
        for case in cases
        if case.get("generation") and "error_code" not in case["generation"]
    ]
    errors = [
        case["generation"]
        for case in cases
        if case.get("generation") and "error_code" in case["generation"]
    ]
    if not generated:
        return {
            "generated_answers": 0,
            "failed_answers": len(errors),
            "citation_coverage": None,
            "valid_citation_rate": None,
            "avg_answer_characters": None,
            "avg_generation_ms": None,
            "avg_completion_tokens": None,
            "avg_tokens_per_second": None,
        }
    with_citation = sum(1 for g in generated if g["verified_citations"])
    total_cited = sum(g["total_citations_detected"] for g in generated)
    total_valid = sum(len(g["verified_citations"]) for g in generated)
    timed = [g["metrics"].get("elapsedMs") for g in generated if g.get("metrics")]
    tokens = [g["metrics"].get("completionTokens") for g in generated if g.get("metrics")]
    rates = [
        g["metrics"].get("tokensPerSecond") for g in generated if g.get("metrics")
    ]
    return {
        "generated_answers": len(generated),
        "failed_answers": len(errors),
        "citation_coverage": round(with_citation / len(generated), 4),
        "valid_citation_rate": (
            round(total_valid / total_cited, 4) if total_cited else None
        ),
        "avg_answer_characters": round(
            sum(len(g["answer"]) for g in generated) / len(generated)
        ),
        "avg_generation_ms": (
            round(sum(timed) / len(timed)) if all(timed) else None
        ),
        "avg_completion_tokens": (
            round(sum(tokens) / len(tokens), 1) if all(tokens) else None
        ),
        "avg_tokens_per_second": (
            round(sum(rates) / len(rates), 2) if all(rates) else None
        ),
    }


def utc_now_iso() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()
