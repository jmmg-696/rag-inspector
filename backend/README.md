# RAG Inspector — Backend

Local RAG pipeline services. Phases 2–3 are real; everything past the
vector store is deliberately mocked in the frontend.

```text
UPLOAD → EXTRACT → CLEAN → CHUNK → EMBED → INDEX → READY
```

No external AI APIs. The embedding model and the vector database both run
on your machine.

## Services (clear boundaries)

| Module | Responsibility | Depends on |
|---|---|---|
| `extraction_service` | PDF (PyMuPDF) / DOCX (python-docx) / TXT / MD → page-structured text | — |
| `cleaning_service` | extraction-artifact removal + cleaning stats | — |
| `chunking_service` | deterministic window chunking | — |
| `document_service` | orchestration + JSON-file storage + indexing pipeline | chunking, embedding, vector store |
| `embedding_service` | loads BGE-M3 **once** (lazy singleton), encodes chunks and queries, exposes model metadata | sentence-transformers, torch |
| `vector_store_service` | **the only** Qdrant client: collection, upsert, scroll, delete, PCA | qdrant-client |

`app/settings.py` centralizes model name, collection, distance, ports and
limits — nothing is hardcoded elsewhere.

### Embeddings

- Model: `BAAI/bge-m3`, 1,024 dimensions, normalized cosine vectors
- Device: CUDA when available, otherwise CPU (no GPU required)
- Model load happens on first use, then is reused for every request
- Embedding + indexing run as a background task after ingestion; document
  status advances `embedding → indexing → ready`, or `error` with a stable
  error code and a retry path (`POST /api/documents/{id}/embed`)

### Determinism (Phase 3 performance rule)

Point ids are UUID5 values derived from `(document_id, chunk_version,
chunk_index)` where `chunk_version` is `"chunk_size:chunk_overlap"`.
Re-indexing the same document with the same settings overwrites the same
points (no duplicates); changing settings produces a new version and
regenerates embeddings. Already-indexed unchanged documents are never
re-embedded just by reading them.

## Storage

```text
backend/data/documents/doc-<id>.json   # one file per document (no DB yet)
Qdrant volume (docker)                 # vectors + payloads
```

## Run it

Requires Python 3.11+.

```bash
docker compose up -d            # Qdrant (from the repo root)
cd backend
python -m venv .venv && .venv/Scripts/activate     # Windows
# source .venv/bin/activate                        # macOS / Linux
pip install -r requirements.txt                    # torch resolves to the CPU build
uvicorn app.main:app --reload --port 8000
```

OpenAPI docs: http://localhost:8000/docs

First ingestion downloads the BGE-M3 weights to the local Hugging Face
cache (one time, a few minutes).

## API

### Documents

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | `{api, qdrant, embedding_model}` component status |
| POST | `/api/documents/ingest` | multipart upload → status `embedding` (background) |
| GET | `/api/documents` | list with chunk/embedding counts and pipeline status |
| GET | `/api/documents/{id}` | detail incl. cleaned per-page text |
| GET | `/api/documents/{id}/chunks` | re-chunk preview with custom settings |
| POST | `/api/documents/{id}/embed` | (re-)run embedding + indexing |
| DELETE | `/api/documents/{id}` | deletes vectors first, then the document — no orphans |

### Embeddings

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/embeddings/model` | model, provider, device, dimensions, load status |
| POST | `/api/embeddings/preview` | embed one chunk on demand (small preview, no storage) |
| POST | `/api/embeddings/query` | real query embedding — groundwork for Phase 4 retrieval |

### Vector store

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/vectors/status` | connection, collection, count, dimensions, distance |
| GET | `/api/vectors/stats` | corpus metrics (vectors, docs, avg chunks, indexed %) |
| GET | `/api/vectors/points` | indexed chunk payloads (browser) |
| GET | `/api/vectors/points/{point_id}` | payload + full 1,024-float vector |
| GET | `/api/vectors/semantic-space` | server-side PCA (NumPy) projection → 2D points |
| DELETE | `/api/vectors/document/{document_id}` | drop one document's vectors |

Error codes: `unsupported_type`, `empty_document`, `invalid_file`,
`too_large`, `invalid_settings`, `not_found`,
`vector_store_unavailable`, `embedding_model_unavailable`,
`embedding_failed`, `collection_mismatch`, `already_running`.

## Environment

| Variable | Default | Use |
|---|---|---|
| `RAG_INSPECTOR_DATA_DIR` | `backend/data/documents` | JSON storage |
| `RAG_INSPECTOR_EMBEDDING_MODEL` | `BAAI/bge-m3` | override model |
| `RAG_INSPECTOR_EMBEDDING_BACKEND` | `auto` | `fake` = deterministic test embedder |
| `RAG_INSPECTOR_FAKE_EMBEDDING_DIMS` | `32` | fake vector size |
| `RAG_INSPECTOR_QDRANT_URL` | `http://127.0.0.1:6333` | or `:memory:` in-process |
| `RAG_INSPECTOR_QDRANT_COLLECTION` | `rag_inspector` | collection name |

## Tests

```bash
cd backend
.venv/Scripts/python.exe -m pytest
```

Unit tests run **hermetically**: a fake deterministic embedder and an
in-process (`:memory:`) Qdrant — no Docker, no model download, no network.
The suite covers extraction per format, validation, chunk size/overlap and
determinism, model metadata, preview determinism and point-id stability
across versions, collection creation and dimension mismatch, upsert /
scroll / retrieve / delete, document vector cleanup, full re-index
idempotency, the extended health endpoint and the Qdrant-unavailable state.

## What comes next

Phase 4: question → query embedding → Qdrant top-K search → context →
Ollama. The payload schema stored with every vector is already designed for
it.
