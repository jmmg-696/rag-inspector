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
  { id: "retrieval", icon: "retrieval", status: "done", detail: "cosine top-K · real Qdrant search" },
  { id: "context", icon: "context", status: "done", detail: "whole chunks within budget" },
  { id: "llm", icon: "llm", status: "done", detail: "Ollama · local" },
  { id: "answer", icon: "answer", status: "done", detail: "with [SOURCE_n] citations" },
];

export const mockQueryPipelineStages: StageMeta[] = [
  { id: "question", icon: "question", status: "done", detail: "your natural-language question" },
  { id: "embeddings", icon: "embeddings", status: "done", detail: "query vector · BGE-M3 local" },
  { id: "retrieval", icon: "retrieval", status: "done", detail: "top-K · cosine · real Qdrant search" },
  { id: "context", icon: "context", status: "done", detail: "SOURCE_n blocks within budget" },
  { id: "prompt", icon: "prompt", status: "done", detail: "what Ollama actually receives" },
  { id: "llm", icon: "llm", status: "done", detail: "local model · Ollama" },
  { id: "answer", icon: "answer", status: "done", detail: "generated text with citations" },
  { id: "sources", icon: "sources", status: "done", detail: "verified against the context" },
];
