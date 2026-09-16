# RAG Inspector — Backend (Phase 2)

Local document intelligence: ingestion, text extraction, cleaning and
deterministic chunking. No embeddings, no vectors, no external APIs — the
whole backend runs on your machine.

## What it does

```text
UPLOAD → EXTRACT → CLEAN → CHUNK → READY
```

- **Extract** — PDF (PyMuPDF, page by page), DOCX (python-docx, paragraph
  boundaries), TXT and Markdown (single logical source).
- **Clean** — removes extraction artifacts (whitespace runs, blank-line
  storms, zero-width characters) without touching content, and reports
  how many artifacts were removed.
- **Chunk** — deterministic character-window chunker with overlap.

### Token approximation

A real tokenizer is not needed until the embeddings phase, so tokens are
approximated as:

```text
1 token ≈ 4 characters
chunk window  = chunk_size × 4 characters
step advance  = (chunk_size − overlap) × 4 characters
```

Windows snap to word boundaries — words are never split — and the same
(document, chunk_size, overlap) always produces byte-identical chunks.

## Storage

Phase 2 uses simple JSON files instead of a database:

```text
backend/data/documents/doc-<id>.json   # one document = metadata + cleaned pages
```

Override the directory with `RAG_INSPECTOR_DATA_DIR`.

## Run it

Requires Python 3.11+.

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate        # Windows
# source .venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | liveness probe used by the frontend status |
| POST | `/api/documents/ingest` | multipart upload (`chunk_size`, `chunk_overlap` form fields) |
| GET | `/api/documents` | list ingested documents |
| GET | `/api/documents/{id}` | document with cleaned per-page text |
| GET | `/api/documents/{id}/chunks?chunk_size=512&chunk_overlap=100` | re-chunk with custom settings |
| DELETE | `/api/documents/{id}` | remove a document |

Errors return a stable machine-readable code:
`unsupported_type`, `empty_document`, `invalid_file`, `too_large`,
`invalid_settings`, `not_found`.

Upload limits: 50 MB, formats `.pdf .docx .txt .md`. Uploaded content is
only ever parsed as text — it is never executed or rendered.

## Tests

```bash
cd backend
.venv/Scripts/python.exe -m pytest
```

Covers extraction per format, validation errors, chunk size/overlap
behaviour and determinism, and the document lifecycle.

## Structure

```text
backend/app/
  main.py                       FastAPI app + CORS + /api/health
  api/documents.py              endpoints and error mapping
  services/extraction_service.py  PDF / DOCX / TXT / MD extraction
  services/cleaning_service.py    artifact removal + stats
  services/chunking_service.py    deterministic chunker
  services/document_service.py    orchestration + JSON storage
  models/document.py              plain dataclasses
  schemas/document.py             pydantic camelCase responses
```

## What comes next

Phase 3 plugs into the existing seam: chunks → embeddings → vectors →
Qdrant. Nothing in this design blocks that step — chunks are already
addressable, page-mapped and deterministic.
