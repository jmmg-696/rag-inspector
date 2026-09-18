"""Centralized Phase 3 configuration.

Everything that touches the embedding model or the vector store reads its
values from here — no hardcoded assumptions scattered across services.

Environment overrides (all optional):
  RAG_INSPECTOR_EMBEDDING_MODEL     default "BAAI/bge-m3"
  RAG_INSPECTOR_EMBEDDING_BACKEND   "auto" | "fake"  (fake = deterministic
                                    tiny vectors for tests/offline dev)
  RAG_INSPECTOR_FAKE_EMBEDDING_DIMS default 32
  RAG_INSPECTOR_QDRANT_URL          default "http://127.0.0.1:6333"
                                    use ":memory:" for an in-process store
  RAG_INSPECTOR_QDRANT_COLLECTION   default "rag_inspector"
"""

from __future__ import annotations

import os
from pathlib import Path

EMBEDDING_MODEL_NAME = os.environ.get(
    "RAG_INSPECTOR_EMBEDDING_MODEL", "BAAI/bge-m3"
)
EMBEDDING_BACKEND = os.environ.get("RAG_INSPECTOR_EMBEDDING_BACKEND", "auto")
FAKE_EMBEDDING_DIMS = int(os.environ.get("RAG_INSPECTOR_FAKE_EMBEDDING_DIMS", "32"))

QDRANT_URL = os.environ.get("RAG_INSPECTOR_QDRANT_URL", "http://127.0.0.1:6333")
QDRANT_COLLECTION = os.environ.get(
    "RAG_INSPECTOR_QDRANT_COLLECTION", "rag_inspector"
)
QDRANT_DISTANCE = "Cosine"
QDRANT_TIMEOUT_SECONDS = 3.0

# Namespace for deterministic point ids (uuid5 of document+version+index).
POINT_ID_NAMESPACE = "6f9d1a2c-5c53-4b6e-9a11-7c1b0f2e3d4c"

VECTOR_PREVIEW_VALUES = 4
SEMANTIC_SPACE_MAX_POINTS = 500

# Phase 5 — local LLM via Ollama (host process, NOT a docker dependency).
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen3:8b")
# Generation budget in wall-clock seconds. CPU machines routinely need
# minutes for a single local generation, so the default is generous;
# lower it once a GPU makes generations fast.
OLLAMA_TIMEOUT_SECONDS = float(os.environ.get("OLLAMA_TIMEOUT_SECONDS", "600"))
OLLAMA_HEALTH_TIMEOUT_SECONDS = 3.0
# Reasoning-mode toggle for thinking-capable models (qwen3). Disabled by
# default so CPU demos stay responsive; set RAG_LLM_THINKING=1 to enable.
OLLAMA_THINKING = os.environ.get("RAG_LLM_THINKING", "").lower() in {
    "1",
    "true",
    "yes",
}

# Generation context budget, in approximated tokens (same 4 chars/token rule).
RAG_MAX_CONTEXT_TOKENS = int(os.environ.get("RAG_MAX_CONTEXT_TOKENS", "4000"))
DEFAULT_TEMPERATURE = float(os.environ.get("RAG_DEFAULT_TEMPERATURE", "0.2"))
# Override with RAG_SYSTEM_PROMPT for experiments (kept honest: the UI always
# shows the prompt that was actually sent).
RAG_SYSTEM_PROMPT = os.environ.get("RAG_SYSTEM_PROMPT", "")

# Phase 6 — evaluation datasets (read-only JSON, human-editable).
DEFAULT_EVAL_DIR = Path(__file__).resolve().parents[2] / "examples" / "evaluation"


def evaluation_dir() -> "Path":
    directory = Path(os.environ.get("RAG_INSPECTOR_EVAL_DIR", DEFAULT_EVAL_DIR))
    return directory

__all__ = [name for name in globals() if name.isupper()]
