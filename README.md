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

As of **Phase 4**, six of the eight pipeline stages are real and local. Ask a
question and watch it become a BGE-M3 query embedding, a cosine top-K search
in Qdrant and a ranked set of chunks — projected in the same 2D semantic
space, with your query as a star.

```text
Documents → Chunking → Embeddings → Vector Store → Retrieval → Context → Local LLM → Answer
  ● real      ● real      ● real        ● real        ● real      ○ Phase 5  ○ Phase 5    ○ Phase 5
```

> **Phase 4 implements real semantic retrieval. LLM answer generation is
> intentionally deferred to Phase 5** — the Playground stops at the real
> retrieved context, and it says so.

No external AI APIs, no cloud services.

## Current Pipeline (Phase 4)

```text
DOCUMENT
    ↓
TEXT EXTRACTION
    ↓
CLEANING
    ↓
CHUNKING
    ↓
EMBEDDINGS (BGE-M3, local)
    ↓
QDRANT (local)
    ↓
USER QUESTION → QUERY EMBEDDING → COSINE TOP-K → RANKED CHUNKS
```

## Semantic Retrieval

Phase 4 makes retrieval real:

```text
USER QUESTION
    ↓
BGE-M3 query embedding (same model, same space as the chunks)
    ↓
Qdrant cosine top-K search
    ↓
Ranked chunks with similarity scores
```

- **Top-K** (1–20) and a **similarity threshold** (0–1) are user-controlled
- Retrieval can be **filtered to a single document**
- Every score is the **actual cosine similarity from Qdrant** — a retrieval
  similarity score, never a confidence score, never a probability
- The Retrieval page overlays the query star on the PCA semantic space and
  highlights exactly the top-K points that Qdrant returned
- No results is a legitimate outcome — the UI explains what to try instead,
  it never invents matches

**Retrieval is not generation.** Retrieval answers "which of my documents
are closest in meaning to this question?" — a mathematical comparison of
vectors. Generation answers "what sentence should the user read?" — that
needs an LLM, and it is Phase 5. RAG Inspector keeps the two visibly apart
so you can debug one without guessing about the other.

```jsonc
// POST /api/retrieval/search
{ "query": "How does the approval process work?", "topK": 3 }

// →
{
  "query": "How does the approval process work?",
  "queryEmbedding": { "model": "BAAI/bge-m3", "dimensions": 1024 },
  "results": [
    { "rank": 1, "score": 0.7075, "documentName": "sample-handbook.txt",
      "chunkIndex": 0, "text": "FIELDSTONE — OPERATIONS HANDBOOK …" }
  ],
  "corpusSize": 3
}
```

## Embeddings

RAG Inspector uses a local embedding model to convert document chunks into
numerical vector representations.

- Model: **BAAI/bge-m3** (1,024 dimensions) via sentence-transformers
- Runs on CPU; CUDA is used automatically when available
- The model loads once per backend process and is reused for every request
- Embeddings and indexing run in the background after chunking, with visible
  progress states (`embedding → indexing → ready`) and retry on failure
- Point ids are deterministic: same document + same chunk settings → same
  vectors, no duplicates; changing chunk settings regenerates cleanly

## Vector Store

Vectors are stored locally in Qdrant using cosine distance.

- Collection `rag_inspector` is created automatically (1,024-dim, Cosine)
- Every vector carries its payload: document, chunk index, page range, text
  and token estimate — ready for Phase 4 retrieval
- Deleting a document deletes its vectors too; no orphans
- The **Vector Store** page shows connection state, statistics, an indexed
  chunk browser and per-vector inspection with a value heatmap

## Semantic Space

The application includes a 2D PCA visualization of the embedding space to
make semantic relationships easier to understand.

Each point is one chunk, projected server-side from 1,024 dimensions to 2.
The UI says so explicitly — this is a *projection* for exploring
relationships, not the actual vector space.

## Features

- **Documents** — real local ingestion: PDF/DOCX/TXT/MD upload with live
  pipeline states (upload → extract → clean → chunk → embed → index),
  per-document embeddings counts and retry on failure
- **Visual Chunking Explorer** — watch a document split into overlapping
  chunks; change chunk size and overlap and the visualization reacts
- **Embeddings tab** — generated/total, model metadata, chunk → vector →
  Qdrant flow, stored vectors fetched straight from the collection, and a
  compact heatmap of every dimension
- **Vector Store page** — Qdrant status, corpus statistics, indexed chunk
  browser, vector detail with heatmap, and the PCA semantic space
- **Retrieval Inspector** — now REAL: ask a question, watch the honest
  stage-by-stage run (embed query → search Qdrant), get ranked chunks with
  actual cosine scores, per-result “Why was this retrieved?” explanations,
  a query vector heatmap, and your query projected as a star in the
  semantic space with the top-K points highlighted
- **Playground** — real retrieval end to end: question → query embedding →
  Qdrant top-K → assembled context, and then an honest stop: *LLM
  generation — Phase 5*. No fabricated answers
- **Overview** — pipeline with real / next-phase / planned stage states and
  live metrics when the local backend is running
- **Learn** — visual step-by-step explanation of how RAG works
- **English / Spanish** — full UI translation, persisted, no reload
- Light/dark themes, responsive layout, keyboard accessibility,
  reduced-motion support — zero external requests at runtime

## Screenshots

> Placeholders — real captures will land in `public/screenshots/`.

| | |
|---|---|
| `public/screenshots/overview.png` | Overview with the RAG pipeline |
| `public/screenshots/chunking.png` | Visual chunking explorer |
| `public/screenshots/embeddings.png` | Vector heatmap |
| `public/screenshots/semantic-space.png` | PCA semantic space |

## Architecture

```text
React  →  /api (Vite proxy)  →  FastAPI
                                   ├─ document services (extract/clean/chunk)
                                   ├─ embedding service ── BGE-M3 (local)
                                   ├─ vector store service ── Qdrant (Docker)
                                   └─ retrieval service (embeds query via the
                                      existing singleton, searches via the
                                      existing store boundary)
```

```text
├── src/                        frontend (React + TS + Vite + Tailwind v4)
│   ├── types/                  domain types
│   ├── i18n/                   en.ts / es.ts / provider (typed keys)
│   ├── services/               http · documentService · vectorStoreService
│   ├── data/                   remaining mock data (playground, retrieval…)
│   ├── lib/  hooks/  theme/
│   ├── components/             layout · ui · pipeline · documents · chunking
│   │                           · embeddings · vectors · retrieval · …
│   └── pages/                  incl. /vector-store and /documents/:id
└── backend/                    FastAPI (see backend/README.md)
    └── app/
        ├── settings.py         model/collection/ports — defined once
        ├── api/                documents · embeddings · vectors · retrieval
        └── services/           extraction · cleaning · chunking · document
                                · embedding · vector_store (Qdrant lives here)
                                · retrieval (search + projected query space)
```

Boundaries matter: `document_service` never imports Qdrant, `embedding_service`
owns the model, **only** `vector_store_service` talks to Qdrant, and
`retrieval_service` reuses those two without duplicating any of them. Phase 5
(context assembly + Ollama) plugs into the same seams.

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
- [x] Local embeddings
- [x] Qdrant integration
- [x] Vector visualization
- [x] Semantic space
- [x] Semantic retrieval
- [x] Top-K search
- [x] Query similarity

- [ ] Ollama integration
- [ ] Real RAG generation
- [ ] Source citations
- [ ] RAG vs No-RAG
- [ ] Evaluation

## Local Development

Requires Node.js 20+, Python 3.11+ and Docker (for Qdrant).

```bash
# 1. Vector store
docker compose up -d

# 2. Backend
cd backend
python -m venv .venv && .venv/Scripts/activate   # Windows
# source .venv/bin/activate                      # macOS / Linux
pip install -r requirements.txt                  # torch resolves to the CPU build
uvicorn app.main:app --reload --port 8000

# 3. Frontend (new terminal, repo root)
npm install
npm run dev
```

First document ingestion after startup loads BGE-M3 once (the model weights
are downloaded to the Hugging Face cache the first time, then reused).

Try it immediately with the fictional sample: `examples/sample-handbook.txt`.

With the backend offline, Documents shows demo data and says so. With Qdrant
offline, ingestion still works and indexing is marked failed — with retry.

## Tech Stack

- React 19 + TypeScript (strict)
- Vite · Tailwind CSS v4 · React Router v7 · Lucide icons
- FastAPI + PyMuPDF + python-docx
- sentence-transformers (BAAI/bge-m3, local CPU/CUDA) + Qdrant (Docker)
- Server-side PCA with NumPy · hand-rolled SVG scatter (no chart library)
- pytest (unit tests run hermetically: fake embedder + in-process Qdrant)

No UI kit, no animation library, no state manager, no chart dependency.
Intentionally.

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
