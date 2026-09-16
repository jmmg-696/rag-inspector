# RAG Inspector

> **RAG shouldn't be a black box.**

A visual playground for understanding how **Retrieval-Augmented Generation** works.

> Understand what happens between a question and an AI-generated answer.

---

## Overview

Most RAG demos show you two boxes: a question going in and an answer coming out.
The interesting part — the actual *retrieval* — is hidden.

**RAG Inspector** makes the whole pipeline visible:

```text
Question
   ↓
Query Embedding
   ↓
Semantic Retrieval
   ↓
Relevant Chunks
   ↓
Context
   ↓
Local LLM
   ↓
Generated Answer
   ↓
Sources
```

The long-term goal is a fully local RAG workbench (Ollama + Qdrant + local
embeddings). This repository currently ships **Phase 1: the complete frontend
prototype, running on realistic mock data** — no backend, no LLM, no vector
database yet. The UI is the product's contract with the user, so it comes first.

## Features

- **Overview** — pipeline visualization with per-stage explanations, corpus metrics and recent query history
- **Documents** — indexed document management with details view (ingestion is mocked, by design)
- **Playground** — ask a question and watch it travel through embedding → retrieval → context → LLM → answer, with clickable sources
- **Retrieval Inspector** — the chunks your query actually retrieves, ranked with similarity scores
- **Evaluation** — quality metrics dashboard (clearly labeled as demo data, never presented as real measurement)
- **Learn** — a visual, step-by-step explanation of how RAG works
- Light and dark themes (persisted locally)
- Fully responsive, keyboard-accessible, local-first — no external requests at runtime

## Screenshots

> Placeholders — real captures will land in `public/screenshots/`.

| | |
|---|---|
| `public/screenshots/overview.png` | Overview with the RAG pipeline |
| `public/screenshots/playground.png` | A question travelling through the pipeline |
| `public/screenshots/retrieval.png` | Ranked chunks and similarity scores |

## Architecture

Frontend-only, organized so that the mock layer can be swapped for a real
backend without touching the UI:

```text
src/
  types/          domain types shared across the app
  data/           ALL mock data lives here (mockDocuments, mockQueries,
                  mockRetrieval, mockEvaluation, mockPipeline, mockLearn,
                  mockPlaygroundRun) — one module per domain
  lib/            tiny pure helpers (formatting, status maps)
  hooks/          useTheme, useLocalStorage
  theme/          theme context + provider
  components/
    layout/       Sidebar, TopBar, MobileNav, AppLayout, routing chrome
    ui/           PageHeader, StatusBadge, MetricCard, Modal, EmptyState,
                  SimilarityBar, Card, Button
    pipeline/     Pipeline, PipelineStep — the hero component
    documents/    DocumentTable, DocumentCard, DocumentDetails
    query/        QueryInput, RecentQueriesTable
    retrieval/    ChunkCard, RetrievalResult
    sources/      SourceCard
    evaluation/   EvalMetricCard, EvalResultsTable
    learn/        LearnVisualBlock
  pages/          one file per route
```

Later phases replace data imports with services:

```text
import { mockDocuments }   from "../data/mockDocuments"     // today
import { documentService } from "../services/documents"    // later

import { getRagRun }  from "../data/mockPlaygroundRun"     // today
import { retrievalService } from "../services/retrieval"   // later
```

No API client, no premature abstraction — just a clean seam.

### Planned backend (not implemented yet)

`FastAPI + Ollama + Qdrant + local embedding models`

## Roadmap

- [x] Initial UI
- [x] Dashboard
- [x] Document interface
- [x] Playground mock
- [x] Retrieval visualization

- [ ] Real document ingestion
- [ ] Chunking engine
- [ ] Local embeddings
- [ ] Qdrant integration
- [ ] Ollama integration
- [ ] Real retrieval
- [ ] Source citations
- [ ] RAG vs No-RAG
- [ ] Chunking playground
- [ ] Evaluation

## Local Development

Requires Node.js 20+.

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run lint     # ESLint
npm run preview  # serve the production build
```

## Tech Stack

- React 19 + TypeScript (strict)
- Vite
- Tailwind CSS v4 (CSS-first theme, class-based dark mode)
- React Router v7
- Lucide icons

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
