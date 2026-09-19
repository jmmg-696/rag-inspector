# RAG Inspector — Backend

Local RAG pipeline services. Phases 2–6 are real (ingestion → chunking →
embeddings → Qdrant → semantic retrieval → generation via Ollama →
evaluation against a golden dataset).

```text
UPLOAD → EXTRACT → CLEAN → CHUNK → EMBED → INDEX → READY

QUESTION → QUERY EMBEDDING (same BGE-M3) → QDRANT COSINE TOP-K → RANKED CHUNKS
         → CONTEXT (budgeted, whole chunks) → PROMPT → OLLAMA → ANSWER → SOURCES

GOLDEN DATASET → anchors resolved against indexed chunks → per-question run
               → Hit Rate@K / Recall@K / Precision@K / MRR (+ citation metrics)
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
| `evaluation_service` | **measurement only**: golden-dataset loading, anchor resolution against indexed chunks, per-case + aggregate IR metrics, optional generation evaluation — never a second pipeline | retrieval, generation, document |

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

### Evaluation

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/evaluation/dataset?name=` | dataset metadata + cases (anchors resolved at run time, never stored) |
| GET | `/api/evaluation/datasets` | available dataset file names |
| POST | `/api/evaluation/run` | `{topK (1–20), scoreThreshold (0–1), dataset?, generateAnswers?, model?, temperature?}` → run summary + per-case expected/retrieved/metrics + aggregates + warnings |

Datasets are human-editable JSON files in `examples/evaluation/` (override
with `RAG_INSPECTOR_EVAL_DIR`). Each case declares a question and a text
**anchor**; at run time every indexed chunk of the dataset's document
containing the anchor (whitespace-normalized) counts as an expected source.

Ground-truth rules: relevance comes **only** from anchors — similarity
scores never decide relevance, no LLM judges anything, and reference
answers are never auto-scored. A case whose anchor resolves to no chunk is
**skipped with a warning**, never scored as a failure. Metrics (exact
definitions): Hit Rate@K = share of evaluated questions with ≥1 expected
source in the top K; Recall@K = expected retrieved / expected, averaged;
Precision@K = expected retrieved / K (always divided by K); MRR = average
1/rank of the first expected source (0 when absent). Generation evaluation
reuses `generation_service` per case and aggregates citation coverage,
valid citation rate and only the timing/token stats Ollama really reports;
per-case generation failures are captured as `error_code`, not raised.

Error codes: `unsupported_type`, `empty_document`, `invalid_file`,
`too_large`, `invalid_settings`, `not_found`,
`vector_store_unavailable`, `embedding_model_unavailable`,
`embedding_failed`, `collection_mismatch`, `already_running`,
`llm_unavailable`, `llm_model_not_found`, `llm_timeout`,
`generation_failed`, `no_indexed_documents`, `invalid_temperature`,
`dataset_not_found`, `dataset_invalid`, `evaluation_document_missing`,
`evaluation_no_resolvable_cases`.

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
| `OLLAMA_MODEL` | `qwen3:8b` | default generation model — `qwen3:4b` recommended on 16 GB RAM (see root README) |
| `OLLAMA_TIMEOUT_SECONDS` | `600` | generation timeout (CPU runs are slow) |
| `RAG_LLM_THINKING` | off | enable reasoning-mode models (qwen3) |
| `RAG_MAX_CONTEXT_TOKENS` | `4000` | whole-chunk context budget (estimated tokens) |
| `RAG_DEFAULT_TEMPERATURE` | `0.2` | default sampling temperature (0–2) |
| `RAG_SYSTEM_PROMPT` | built-in | override prompt rules (UI always shows what was sent) |
| `RAG_INSPECTOR_EVAL_DIR` | `examples/evaluation` | golden-dataset JSON directory (read-only) |

## Tests

```bash
cd backend
.venv/Scripts/python.exe -m pytest
```

Unit tests run **hermetically**: a fake deterministic embedder, an
in-process (`:memory:`) Qdrant and a fake Ollama (the service layer is
monkeypatched; `OLLAMA_BASE_URL` points at a closed port) — no Docker, no
model downloads, no network, no GPU. 97 tests cover extraction per format,
validation, chunk size/overlap and determinism, model metadata, preview
determinism and point-id stability across versions, collection creation and
dimension mismatch, upsert / scroll / retrieve / delete, document vector
cleanup, full re-index idempotency, the extended health endpoint and the
Qdrant-unavailable state, semantic retrieval (score ordering, Top-K limits,
similarity thresholds, document filtering, empty corpus, validation bounds,
embedding and store failure modes, projected query space), generation
(context budget keeps whole chunks in rank order, source ids, prompt
structure, citation validation with unresolved markers, end-to-end
orchestration, NDJSON stream stage sequence and every LLM failure mode:
unavailable, model missing, timeout, mid-stream failure) and evaluation
(dataset validation, anchor resolution incl. overlap duplicates and
whitespace normalization, exact metric math, relevance scoped by
`(document_id, chunk_id)` — cross-document chunk-id collision regression —
skipped-case flow, aggregate citation metrics with null handling,
generation failure capture and API error mapping).

## Scope

The backend is feature-complete through Phase 6. The evaluation run schema
(per-case retrieval + generation + metrics) is intentionally generic:
future experiments — alternative datasets, different retrieval
configurations — plug into it without new plumbing.
