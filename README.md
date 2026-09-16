# RAG Inspector

> **RAG shouldn't be a black box.**

A visual playground for understanding how **Retrieval-Augmented Generation** works.

> Understand what happens between a question and an AI-generated answer.

---

## Overview

Most RAG demos show you two boxes: a question going in and an answer coming
out. The interesting part — the actual *retrieval* — is hidden.

**RAG Inspector** makes the whole pipeline visible. Every operation shows two
layers: **what happened** (the real numbers) and **why it matters** (the human
explanation).

As of **Phase 2**, the front of the pipeline is real: upload a local PDF,
DOCX, TXT or Markdown document and watch it become cleaned, page-mapped,
deterministic chunks — with a visual chunking explorer you can retune live.

```text
Documents  →  Chunking  →  Embeddings  →  Vector Store  →  Retrieval  →  Context  →  Local LLM  →  Answer
  ● real       ● real        ○ next phase     ○ planned        ○ mock        ○ mock       ○ mock       ○ mock
```

Everything runs locally. No embeddings, no Qdrant, no Ollama and no answer
generation yet — those are deliberately reserved for later phases.

## Current Pipeline (Phase 2)

```text
DOCUMENT
    ↓
TEXT EXTRACTION
    ↓
CLEANING
    ↓
CHUNKING
    ↓
CHUNKS
```

Phase 2 focuses on making document ingestion and chunking visible and
understandable. Embeddings and retrieval will be introduced in the next
phases.

## Features

- **Documents** — real local ingestion: upload PDF/DOCX/TXT/MD, see per-page
  extracted text, cleaning statistics and every generated chunk
- **Visual Chunking Explorer** — watch a document split into overlapping
  chunks; change chunk size and overlap and the visualization reacts
- **Ingestion pipeline** — Upload → Extract → Clean → Chunk → Ready, with a
  plain-language explanation under each step
- **Overview** — the RAG pipeline with available / current-phase / planned
  stage states, corpus metrics and query history
- **Playground** — simulated question → answer run with clickable sources
- **Retrieval Inspector** — ranked chunks with similarity bars (mocked)
- **Evaluation** — quality dashboard, clearly labeled as demo data
- **Learn** — visual step-by-step explanation of how RAG works
- **English / Spanish** — full UI translation, persisted, no reload
- Light and dark themes, responsive layout, keyboard accessibility,
  reduced-motion support — all local, zero external requests

## Screenshots

> Placeholders — real captures will land in `public/screenshots/`.

| | |
|---|---|
| `public/screenshots/overview.png` | Overview with the RAG pipeline |
| `public/screenshots/documents.png` | Ingested documents |
| `public/screenshots/chunking.png` | Visual chunking explorer |
| `public/screenshots/playground.png` | A question travelling through the pipeline |

## Architecture

```text
├── src/                     frontend (React + TS + Vite + Tailwind v4)
│   ├── types/               domain types
│   ├── i18n/                en.ts / es.ts / provider (typed keys, no scattered strings)
│   ├── services/            documentService — the seam for the backend
│   ├── data/                remaining mock data (queries, retrieval, evaluation…)
│   ├── lib/                 tiny pure helpers
│   ├── hooks/  theme/
│   ├── components/          layout · ui · pipeline · documents · chunking ·
│   │                        query · retrieval · sources · evaluation · learn
│   └── pages/               one file per route
└── backend/                 FastAPI (see backend/README.md)
    └── app/                 api · services (extraction, cleaning, chunking,
                             document) · models · schemas
```

The frontend talks to the backend **only** through `src/services/documentService.ts`
(Vite proxies `/api` → `http://localhost:8000`). The remaining mock modules
(`mockQueries`, `mockRetrieval`, `mockEvaluation`) will be replaced by the
same service pattern when retrieval and generation land.

Tokens are approximated at ~4 characters per token until a real tokenizer
arrives with the embeddings phase — the UI says so explicitly wherever it
matters.

### Planned (not implemented yet)

`Ollama` for local generation · `Qdrant` for vectors · `BGE-M3` embeddings.

## Roadmap

- [x] Initial UI
- [x] Dashboard
- [x] Document interface
- [x] Playground mock
- [x] Retrieval visualization
- [x] Local document ingestion
- [x] Text extraction
- [x] Document cleaning
- [x] Chunking engine
- [x] Visual chunking explorer
- [x] English / Spanish

- [ ] Embeddings
- [ ] Qdrant integration
- [ ] Semantic retrieval
- [ ] Ollama integration
- [ ] Real RAG generation
- [ ] Source citations
- [ ] RAG vs No-RAG
- [ ] Chunking experiments
- [ ] Evaluation

## Local Development

Requires Node.js 20+ and Python 3.11+.

**Frontend**

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run lint
```

**Backend** (needed for the Documents page; everything else runs on mock data)

```bash
cd backend
python -m venv .venv && .venv/Scripts/activate   # Windows
# source .venv/bin/activate                      # macOS / Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Try it immediately with the fictional sample: `examples/sample-handbook.txt`.

With the backend offline, Documents shows demo data and says so — no silent
degradation.

## Tech Stack

- React 19 + TypeScript (strict)
- Vite
- Tailwind CSS v4 (CSS-first theme, class-based dark mode)
- React Router v7 · Lucide icons
- FastAPI + PyMuPDF + python-docx (backend)
- pytest for the ingestion pipeline

No UI kit, no animation library, no state manager. Intentionally.

## Why RAG Inspector?

Because "Question → AI → Answer" teaches people nothing. RAG is a pipeline of
concrete, inspectable steps — documents, chunks, vectors, similarity scores,
context assembly, generation. When you can *see* each step, the magic becomes
engineering.

RAG Inspector is built to be both:

- a real local-first dev tool, and
- the clearest way to **learn** how retrieval actually works.

Everything runs on your machine. Nothing phones home.

## License

[MIT](./LICENSE)
