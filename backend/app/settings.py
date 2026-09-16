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

__all__ = [name for name in globals() if name.isupper()]
