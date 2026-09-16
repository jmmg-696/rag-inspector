"""RAG generation orchestration (Phase 5).

query → retrieval_service (existing) → context_service → prompt_service →
ollama_service. The frontend never orchestrates these steps — this module
owns the pipeline and reports every stage with real timings.

Citation policy: identifiers are validated against the sources actually
placed in the context. Unknown [SOURCE_999] citations are reported as
unresolved — never dropped silently, never promoted to real sources.
"""

from __future__ import annotations

import re
import time
from typing import Any, Iterator

from . import (
    context_service,
    ollama_service,
    prompt_service,
    retrieval_service,
)
from .context_service import ContextResult, SourceBlock
from .embedding_service import EmbeddingError
from .ollama_service import OllamaError
from .vector_store_service import VectorStoreError

CITATION_RE = re.compile(r"\[SOURCE_(\d{1,3})\]")


class GenerationError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def parse_citations(
    answer: str, blocks: list[SourceBlock]
) -> tuple[list[str], list[int]]:
    """Return (verified source ids, unresolved source numbers)."""
    known = {block.number: block.source_id for block in blocks}
    verified: list[str] = []
    unresolved: list[int] = []
    for number in sorted({int(m) for m in CITATION_RE.findall(answer)}):
        if number in known:
            verified.append(known[number])
        else:
            unresolved.append(number)
    return verified, unresolved


def _retrieval(query: str, top_k: int, threshold: float, document_id: str | None) -> dict[str, Any]:
    started = time.perf_counter()
    try:
        result = retrieval_service.search(
            query=query,
            top_k=top_k,
            score_threshold=threshold,
            document_id=document_id,
        )
    except (EmbeddingError, VectorStoreError) as error:
        raise GenerationError(error.code, error.message) from error
    result["retrieval_ms"] = round((time.perf_counter() - started) * 1000)
    return result


def _finish(
    query: str,
    model: str,
    temperature: float,
    retrieval: dict[str, Any],
    context: ContextResult,
    prompt: dict[str, Any],
    answer: str | None,
    metrics: dict[str, Any] | None,
) -> dict[str, Any]:
    verified, unresolved = parse_citations(answer or "", context.blocks)
    return {
        "query": query,
        "model": model,
        "temperature": temperature,
        "retrieval": {
            "top_k": retrieval["top_k"],
            "score_threshold": retrieval["score_threshold"],
            "filtered_document_id": retrieval["filtered_document_id"],
            "corpus_size": retrieval["corpus_size"],
            "total_results": retrieval["total_results"],
            "results": retrieval["results"],
            "retrieval_ms": retrieval["retrieval_ms"],
        },
        "context": {
            "retrieved_chunks": context.retrieved_chunks,
            "included_chunks": context.included_chunks,
            "estimated_tokens": context.estimated_tokens,
            "sources": [block.to_payload() for block in context.blocks],
        },
        "prompt": prompt,
        "answer": answer,
        "citations": {
            "verified": verified,
            "unresolved": unresolved,
        },
        "generation_metrics": metrics,
    }


def run(
    query: str,
    top_k: int = 5,
    score_threshold: float = 0.0,
    document_id: str | None = None,
    model: str | None = None,
    temperature: float | None = None,
) -> dict[str, Any]:
    resolved_model = model  # validated below
    temperature = _validated_temperature(temperature)
    retrieval = _retrieval(query, top_k, score_threshold, document_id)
    if retrieval["corpus_size"] == 0:
        raise GenerationError(
            "no_indexed_documents",
            "Upload and index a document before running RAG.",
        )
    context = context_service.build_context(retrieval["results"])
    prompt = prompt_service.build_prompt(context, query)
    if context.is_empty:
        return _finish(
            query, resolved_model or "", temperature, retrieval, context,
            prompt, answer=None, metrics=None,
        )
    from .ollama_service import OllamaError

    try:
        model_name = _prepare_model(resolved_model)
        output = ollama_service.generate(
            model_name, prompt["full_prompt"], temperature
        )
    except OllamaError as error:
        raise GenerationError(error.code, error.message) from error
    return _finish(
        query, model_name, temperature, retrieval, context, prompt,
        answer=output["response"].strip(),
        metrics=output["metrics"],
    )


def run_stream(
    query: str,
    top_k: int = 5,
    score_threshold: float = 0.0,
    document_id: str | None = None,
    model: str | None = None,
    temperature: float | None = None,
) -> Iterator[dict[str, Any]]:
    """NDJSON event iterator with REAL stage transitions (no fake timers)."""
    temperature = _validated_temperature(temperature)
    yield {"type": "stage", "stage": "retrieving"}
    retrieval = _retrieval(query, top_k, score_threshold, document_id)
    if retrieval["corpus_size"] == 0:
        yield {
            "type": "error",
            "code": "no_indexed_documents",
            "message": "Upload and index a document before running RAG.",
        }
        return
    yield {"type": "retrieval", "payload": {
        "corpus_size": retrieval["corpus_size"],
        "total_results": retrieval["total_results"],
        "retrieval_ms": retrieval["retrieval_ms"],
    }}
    yield {"type": "stage", "stage": "building_context"}
    context = context_service.build_context(retrieval["results"])
    yield {"type": "stage", "stage": "building_prompt"}
    prompt = prompt_service.build_prompt(context, query)
    if context.is_empty:
        yield {
            "type": "result",
            "payload": _finish(
                query, "", temperature, retrieval, context, prompt,
                answer=None, metrics=None,
            ),
        }
        return
    try:
        model_name = _prepare_model(model)
    except (OllamaError, GenerationError) as error:
        yield {"type": "error", "code": error.code, "message": error.message}
        return
    yield {
        "type": "stage",
        "stage": "generating",
        "model": model_name,
        "temperature": temperature,
    }
    answer_parts: list[str] = []
    metrics: dict[str, Any] | None = None
    try:
        for kind, value in ollama_service.generate_stream(
            model_name, prompt["full_prompt"], temperature
        ):
            if kind == "token":
                answer_parts.append(value)
                yield {"type": "token", "text": value}
            else:
                metrics = value
    except OllamaError as error:
        yield {"type": "error", "code": error.code, "message": error.message}
        return
    yield {
        "type": "result",
        "payload": _finish(
            query, model_name, temperature, retrieval, context, prompt,
            answer="".join(answer_parts).strip(),
            metrics=metrics,
        ),
    }


def _validated_temperature(temperature: float | None) -> float:
    value = (
        temperature
        if temperature is not None
        else _default_temperature()
    )
    if not 0.0 <= value <= 2.0:
        raise GenerationError(
            "invalid_temperature", "Temperature must be between 0 and 2."
        )
    return value


def _default_temperature() -> float:
    from .. import settings

    return settings.DEFAULT_TEMPERATURE


def _prepare_model(model: str | None) -> str:
    from .. import settings

    name = model or settings.OLLAMA_MODEL
    ollama_service.ensure_model(name)
    return name
