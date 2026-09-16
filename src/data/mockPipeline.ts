import type { StageIconKey, StageStatus } from "../types/domain";

export interface StageMeta {
  id: string;
  icon: StageIconKey;
  status: StageStatus;
  detail: string;
}

export const mockPipelineStages: StageMeta[] = [
  { id: "documents", icon: "documents", status: "done", detail: "12 documents indexed" },
  { id: "chunking", icon: "chunking", status: "done", detail: "512 tokens · 15% overlap" },
  { id: "embeddings", icon: "embeddings", status: "current", detail: "BGE-M3 · 1,024 dim" },
  { id: "vector-store", icon: "vector-store", status: "upcoming", detail: "Qdrant · HNSW index" },
  { id: "retrieval", icon: "retrieval", status: "upcoming", detail: "top 5 · threshold 0.60" },
  { id: "context", icon: "context", status: "upcoming", detail: "3 chunks · 24% of window" },
  { id: "llm", icon: "llm", status: "upcoming", detail: "llama3.2:3b · 100% local" },
  { id: "answer", icon: "answer", status: "upcoming", detail: "cited from 2 sources" },
];

export const mockQueryPipelineStages: StageMeta[] = [
  { id: "question", icon: "question", status: "done", detail: "embedded as a query vector" },
  { id: "embeddings", icon: "embeddings", status: "current", detail: "BGE-M3 · 1,024 dimensions" },
  { id: "retrieval", icon: "retrieval", status: "current", detail: "top 5 candidates scored" },
  { id: "context", icon: "context", status: "current", detail: "3 chunks assembled" },
  { id: "llm", icon: "llm", status: "current", detail: "llama3.2:3b · streaming" },
  { id: "answer", icon: "answer", status: "current", detail: "generated with citations" },
];
