"""Local embedding service (BGE-M3 via sentence-transformers).

The model is loaded lazily ONCE and reused for every subsequent request —
never per chunk. On machines without a GPU the CPU build is used.

For tests and offline development, RAG_INSPECTOR_EMBEDDING_BACKEND=fake
switches to a deterministic, dependency-free pseudo-embedder (hash-seeded
uniform vectors) with the same interface.
"""

from __future__ import annotations

import hashlib
import random
from typing import Any

from .. import settings


class EmbeddingError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


class _State:
    model: Any = None
    status: str = "idle"  # idle | loading | ready | error
    error_message: str = ""
    dimensions: int = 0


_state = _State()


def is_fake() -> bool:
    return settings.EMBEDDING_BACKEND == "fake"


def device() -> str:
    if is_fake():
        return "cpu"
    try:
        import torch

        return "cuda" if torch.cuda.is_available() else "cpu"
    except Exception:  # noqa: BLE001
        return "cpu"


def _fake_vector(text: str, dimensions: int) -> list[float]:
    seed = int.from_bytes(hashlib.sha256(text.encode("utf-8")).digest()[:8], "big")
    rng = random.Random(seed)
    return [round(rng.uniform(-1, 1), 5) for _ in range(dimensions)]


def _fake_dimensions() -> int:
    return settings.FAKE_EMBEDDING_DIMS


def _ensure_model() -> None:
    if is_fake():
        _state.dimensions = _fake_dimensions()
        _state.status = "ready"
        return
    if _state.model is not None:
        return
    _state.status = "loading"
    try:
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer(
            settings.EMBEDDING_MODEL_NAME, device=device()
        )
        _state.model = model
        if hasattr(model, "get_embedding_dimension"):
            dimensions: int = model.get_embedding_dimension()
        else:  # sentence-transformers < 6
            dimensions = model.get_sentence_embedding_dimension()
        _state.dimensions = int(dimensions)
        _state.error_message = ""
        _state.status = "ready"
    except Exception as error:  # noqa: BLE001
        _state.status = "error"
        _state.error_message = str(error)
        raise EmbeddingError(
            "embedding_model_unavailable",
            "The local embedding model could not be loaded.",
        ) from error


def encode(texts: list[str]) -> list[list[float]]:
    """Embed one or more texts. Deterministic for the fake backend."""
    _ensure_model()
    try:
        if is_fake():
            return [_fake_vector(text, _fake_dimensions()) for text in texts]
        vectors = _state.model.encode(
            texts,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )
        return [vector.tolist() for vector in vectors]
    except EmbeddingError:
        raise
    except Exception as error:  # noqa: BLE001
        raise EmbeddingError(
            "embedding_failed", "The chunk could not be embedded."
        ) from error


def encode_one(text: str) -> list[float]:
    return encode([text])[0]


def metadata() -> dict[str, Any]:
    dimensions = _fake_dimensions() if is_fake() else _state.dimensions
    return {
        "model": settings.EMBEDDING_MODEL_NAME,
        "provider": "Local",
        "device": device(),
        "dimensions": dimensions or None,
        "status": _state.status if not is_fake() else "ready",
    }


def status() -> str:
    return "ready" if is_fake() else _state.status


def reset_for_tests() -> None:
    _state.model = None
    _state.status = "idle"
    _state.error_message = ""
    _state.dimensions = 0


__all__ = [
    "EmbeddingError",
    "device",
    "encode",
    "encode_one",
    "metadata",
    "reset_for_tests",
    "status",
]
