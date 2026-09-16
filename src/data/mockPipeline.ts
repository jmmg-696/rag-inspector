import type { StageIconKey, StageStatus } from "../types/domain";

export interface StageMeta {
  id: string;
  icon: StageIconKey;
  status: StageStatus;
  detail: string;
}

export const mockPipelineStages: StageMeta[] = [
  { id: "documents", icon: "documents", status: "done", detail: "real · local backend" },
  { id: "chunking", icon: "chunking", status: "done", detail: "deterministic · overlap" },
  { id: "embeddings", icon: "embeddings", status: "done", detail: "BGE-M3 · 1,024 dim · local" },
  { id: "vector-store", icon: "vector-store", status: "done", detail: "Qdrant · COSINE · local" },
  { id: "retrieval", icon: "retrieval", status: "current", detail: "top 5 · threshold 0.60 · Phase 4" },
  { id: "context", icon: "context", status: "upcoming", detail: "3 chunks · 24% of window" },
  { id: "llm", icon: "llm", status: "upcoming", detail: "llama3.2:3b · 100% local" },
  { id: "answer", icon: "answer", status: "upcoming", detail: "cited from 2 sources" },
];

export const mockQueryPipelineStages: StageMeta[] = [
  { id: "question", icon: "question", status: "done", detail: "embedded as a query vector" },
  { id: "embeddings", icon: "embeddings", status: "done", detail: "query embedding · BGE-M3 local" },
  { id: "retrieval", icon: "retrieval", status: "current", detail: "top-K · Phase 4 (mocked today)" },
  { id: "context", icon: "context", status: "upcoming", detail: "3 chunks assembled" },
  { id: "llm", icon: "llm", status: "upcoming", detail: "llama3.2:3b · streaming" },
  { id: "answer", icon: "answer", status: "upcoming", detail: "generated with citations" },
];
