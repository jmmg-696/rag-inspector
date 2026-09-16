"""Ollama transport service — the ONLY module that talks to Ollama.

Health/status checks never generate; they only hit /api/tags. Generation
uses /api/generate with the raw prompt built by prompt_service. No cloud
providers, no fallbacks, no silent model substitution.
"""

from __future__ import annotations

import json
import time
from typing import Any, Iterator

import httpx

from .. import settings


class OllamaError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def _client(timeout: float) -> httpx.Client:
    return httpx.Client(base_url=settings.OLLAMA_BASE_URL, timeout=timeout)


def _model_names(models: list[dict[str, Any]]) -> list[str]:
    return [str(model.get("name", "")) for model in models]


def list_models() -> list[str]:
    """Local model names, sorted. Raises OllamaError if unreachable."""
    try:
        with _client(settings.OLLAMA_HEALTH_TIMEOUT_SECONDS) as client:
            response = client.get("/api/tags")
            response.raise_for_status()
            return sorted(_model_names(response.json().get("models", [])))
    except httpx.HTTPError as error:
        raise OllamaError(
            "llm_unavailable",
            "Ollama is not reachable at the configured base URL.",
        ) from error


def status() -> dict[str, Any]:
    configured = settings.OLLAMA_MODEL
    try:
        models = list_models()
    except OllamaError:
        return {
            "available": False,
            "base_url": settings.OLLAMA_BASE_URL,
            "configured_model": configured,
            "model_available": False,
            "models": [],
        }
    return {
        "available": True,
        "base_url": settings.OLLAMA_BASE_URL,
        "configured_model": configured,
        "model_available": configured in models,
        "models": models,
    }


def health() -> str:
    """One of: ok | unavailable | model_missing (never generates)."""
    state = status()
    if not state["available"]:
        return "unavailable"
    return "ok" if state["model_available"] else "model_missing"


def ensure_model(model: str) -> None:
    models = list_models()
    if model not in models:
        raise OllamaError(
            "llm_model_not_found",
            f"Model “{model}” is not installed locally. "
            f"Run: ollama pull {model}",
        )


def _request_options(temperature: float) -> dict[str, Any]:
    return {"temperature": temperature}


def generate(
    model: str,
    prompt: str,
    temperature: float = settings.DEFAULT_TEMPERATURE,
) -> dict[str, Any]:
    """Blocking generation. Returns text + REAL metrics reported by Ollama."""
    started = time.perf_counter()
    try:
        with _client(settings.OLLAMA_TIMEOUT_SECONDS) as client:
            response = client.post(
                "/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "think": settings.OLLAMA_THINKING,
                    "options": _request_options(temperature),
                },
            )
            response.raise_for_status()
            payload = response.json()
    except httpx.TimeoutException as error:
        raise OllamaError(
            "llm_timeout",
            "Ollama took longer than the configured timeout to answer.",
        ) from error
    except httpx.HTTPStatusError as error:
        raise OllamaError(
            "generation_failed",
            f"Ollama returned an error: {error.response.status_code}",
        ) from error
    except httpx.HTTPError as error:
        raise OllamaError(
            "llm_unavailable",
            "Ollama is not reachable at the configured base URL.",
        ) from error

    elapsed_ms = round((time.perf_counter() - started) * 1000)
    return {
        "response": str(payload.get("response", "")),
        "metrics": _metrics(payload, elapsed_ms),
    }


def generate_stream(
    model: str,
    prompt: str,
    temperature: float = settings.DEFAULT_TEMPERATURE,
) -> Iterator[tuple[str, Any]]:
    """Yield ("token", str) as they arrive, then ("metrics", dict) at the end."""
    started = time.perf_counter()
    final: dict[str, Any] = {}
    try:
        with _client(settings.OLLAMA_TIMEOUT_SECONDS) as client:
            with client.stream(
                "POST",
                "/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": True,
                    "think": settings.OLLAMA_THINKING,
                    "options": _request_options(temperature),
                },
            ) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if not line:
                        continue
                    chunk = json.loads(line)
                    if chunk.get("error"):
                        raise OllamaError(
                            "generation_failed", str(chunk["error"])
                        )
                    piece = chunk.get("response")
                    if piece:
                        yield "token", piece
                    if chunk.get("done"):
                        final = chunk
                        break
    except OllamaError:
        raise
    except httpx.TimeoutException as error:
        raise OllamaError(
            "llm_timeout",
            "Ollama took longer than the configured timeout to answer.",
        ) from error
    except httpx.HTTPError as error:
        raise OllamaError(
            "llm_unavailable",
            "Ollama is not reachable at the configured base URL.",
        ) from error

    yield "metrics", _metrics(final, round((time.perf_counter() - started) * 1000))


def _metrics(payload: dict[str, Any], elapsed_ms: int) -> dict[str, Any]:
    """Only real values Ollama reported; missing metrics stay absent.

    Keys are the public API shape (camelCase) and are documented in the
    README: elapsedMs, completionTokens, promptTokens, tokensPerSecond.
    """
    metrics: dict[str, Any] = {"elapsedMs": elapsed_ms}
    if payload.get("eval_count") is not None:
        metrics["completionTokens"] = payload["eval_count"]
    if payload.get("prompt_eval_count") is not None:
        metrics["promptTokens"] = payload["prompt_eval_count"]
    eval_duration_ns = payload.get("eval_duration")
    completion_tokens = payload.get("eval_count")
    if (
        isinstance(eval_duration_ns, (int, float))
        and eval_duration_ns > 0
        and isinstance(completion_tokens, int)
        and completion_tokens > 0
    ):
        metrics["tokensPerSecond"] = round(
            completion_tokens / (eval_duration_ns / 1e9), 2
        )
    return metrics
