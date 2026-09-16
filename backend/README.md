# RAG Inspector — Backend

Local RAG pipeline services. Phases 2–4 are real (ingestion → chunking →
embeddings → Qdrant → semantic retrieval); answer generation is
deliberately not here yet.

```text
UPLOAD → EXTRACT → CLEAN → CHUNK → EMBED → INDEX → READY

QUESTION → QUERY EMBEDDING (same BGE-M3) → QDRANT COSINE TOP-K → RANKED CHUNKS
         → CONTEXT (budgeted, whole chunks) → PROMPT → OLLAMA → ANSWER → SOURCES
```

No external AI APIs. The embedding model, the vector database, retrieval and
the LLM (Ollama on the host) all run on your machine.

## Services (clear boundaries)

| Module | Responsibility | Depends on |
|---|---|---|
| `extraction_service` | PDF (PyMuPDF) / DOCX (python-docx) / TXT / MD → page-structured text | — |
| `cleaning_service` | extraction-artifact removal + cleaning stats | — |
| `chunking_service` | deterministic window chunking | — |
| `document_service` | orchestration + JSON-file storage + indexing pipeline | chunking, embedding, vector store |
| `embedding_service` | loads BGE-M3 **once** (lazy singleton), encodes chunks and queries, exposes model metadata | sentence-transformers, torch |
| `vector_store_service` | **the only** Qdrant client: collection, upsert, scroll, **cosine search**, delete, PCA | qdrant-client |
| `retrieval_service` | question → query embedding (via the existing singleton) → Qdrant top-K → ranked results; also projects the query into the PCA space | embedding, vector store |
| `context_service` | ranked chunks → `SOURCE_n` blocks packed whole into a token budget | — |
| `prompt_service` | deterministic system rules + context + question → the exact prompt string sent to the LLM | settings |
| `ollama_service` | **the only** Ollama client: status/models (never generates), blocking generate, NDJSON token streaming, real metrics only | httpx, Ollama |
| `generation_service` | RAG orchestration: retrieval → context → prompt → Ollama, citation validation, per-stage timings | everything above |

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

### Retrieval

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/retrieval/search` | `{query, topK (1–20), scoreThreshold (0–1), documentId?, includeEmbedding?}` → ranked hits with **real Qdrant cosine scores** |
| POST | `/api/retrieval/semantic-space` | same params → PCA points + the query's 2D position + `retrieved`/`score` flags per point |

Scores are retrieval similarity — never confidence, correctness or
probability. Empty corpora return `corpusSize: 0` with zero results rather
than an error; Qdrant failures return a stable 503 `vector_store_unavailable`
and the model failing returns 502/503 — never a silent fallback.

Example:

```bash
curl -X POST http://localhost:8000/api/retrieval/search \
  -H "Content-Type: application/json" \
  -d '{"query": "How does the approval process work?", "topK": 3}'
```

### LLM status

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/llm/status` | Ollama reachability, configured model, model availability, local model list (never generates, never pulls) |
| GET | `/api/llm/models` | locally installed model names |

### Generation

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/generation/generate` | `{query, topK, scoreThreshold, documentId?, model?, temperature?}` → full RAG run: retrieval + context + the exact prompt + answer + validated citations + real metrics |
| POST | `/api/generation/stream` | same body; responds with NDJSON events — `stage` (retrieving → building_context → building_prompt → generating), `retrieval`, `token`, `result`, `error` — real stage transitions, cancellable |

Citation policy: `[SOURCE_n]` markers in the answer are validated against
the context. Valid ones surface as sources; unknown ones are reported as
unresolved and never promoted. Generation never falls back to mocks; if
Ollama or the model is missing the request fails with a stable code.

Error codes: `unsupported_type`, `empty_document`, `invalid_file`,
`too_large`, `invalid_settings`, `not_found`,
`vector_store_unavailable`, `embedding_model_unavailable`,
`embedding_failed`, `collection_mismatch`, `already_running`,
`llm_unavailable`, `llm_model_not_found`, `llm_timeout`,
`generation_failed`, `no_indexed_documents`, `invalid_temperature`.

## Environment

| Variable | Default | Use |
|---|---|---|
| `RAG_INSPECTOR_DATA_DIR` | `backend/data/documents` | JSON storage |
| `RAG_INSPECTOR_EMBEDDING_MODEL` | `BAAI/bge-m3` | override model |
| `RAG_INSPECTOR_EMBEDDING_BACKEND` | `auto` | `fake` = deterministic test embedder |
| `RAG_INSPECTOR_FAKE_EMBEDDING_DIMS` | `32` | fake vector size |
| `RAG_INSPECTOR_QDRANT_URL` | `http://127.0.0.1:6333` | or `:memory:` in-process |
| `RAG_INSPECTOR_QDRANT_COLLECTION` | `rag_inspector` | collection name |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | local Ollama server |
| `OLLAMA_MODEL` | `qwen3:8b` | default generation model |
| `OLLAMA_TIMEOUT_SECONDS` | `600` | generation timeout (CPU runs are slow) |
| `RAG_LLM_THINKING` | off | enable reasoning-mode models (qwen3) |
| `RAG_MAX_CONTEXT_TOKENS` | `4000` | whole-chunk context budget (estimated tokens) |
| `RAG_DEFAULT_TEMPERATURE` | `0.2` | default sampling temperature (0–2) |
| `RAG_SYSTEM_PROMPT` | built-in | override prompt rules (UI always shows what was sent) |

## Tests

```bash
cd backend
.venv/Scripts/python.exe -m pytest
```

Unit tests run **hermetically**: a fake deterministic embedder, an
in-process (`:memory:`) Qdrant and a fake Ollama (the service layer is
monkeypatched; `OLLAMA_BASE_URL` points at a closed port) — no Docker, no
model downloads, no network, no GPU. 77 tests cover extraction per format,
validation, chunk size/overlap and determinism, model metadata, preview
determinism and point-id stability across versions, collection creation and
dimension mismatch, upsert / scroll / retrieve / delete, document vector
cleanup, full re-index idempotency, the extended health endpoint and the
Qdrant-unavailable state, semantic retrieval (score ordering, Top-K limits,
similarity thresholds, document filtering, empty corpus, validation bounds,
embedding and store failure modes, projected query space) and generation
(context budget keeps whole chunks in rank order, source ids, prompt
structure, citation validation with unresolved markers, end-to-end
orchestration, NDJSON stream stage sequence and every LLM failure mode:
unavailable, model missing, timeout, mid-stream failure).

## What comes next

Phase 6+: evaluation — golden datasets, faithfulness/answer-relevance
metrics as an explicitly labeled evaluation signal, and RAG vs No-RAG
comparisons. The Phase 5 response schema (retrieval + context + prompt +
citations + metrics per run) is already shaped for it.
