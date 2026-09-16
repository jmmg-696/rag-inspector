export type DocumentStatus = "ready" | "processing" | "failed";

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: string;
  pages: number;
  chunks: number;
  status: DocumentStatus;
  embedding: string;
  addedAgo: string;
}

export type StageIconKey =
  | "documents"
  | "chunking"
  | "embeddings"
  | "vector-store"
  | "retrieval"
  | "context"
  | "llm"
  | "answer";

export interface PipelineStage {
  id: string;
  label: string;
  icon: StageIconKey;
  description: string;
  detail: string;
}

export interface RecentQuery {
  id: string;
  question: string;
  score: number;
  chunks: number;
  responseTimeMs: number;
  ranAgo: string;
}

export interface OverviewMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export interface RetrievedChunk {
  id: string;
  rank: number;
  document: string;
  page: number;
  similarity: number;
  text: string;
}

export interface RagAnswer {
  text: string;
  model: string;
  latencyMs: number;
}

export interface SourceReference {
  id: string;
  document: string;
  page: number;
  similarity: number;
  snippet: string;
}

export interface RagRunResult {
  answer: RagAnswer;
  sources: SourceReference[];
}

export interface EvalMetric {
  id: string;
  label: string;
  value: number;
  description: string;
}

export type EvalStatus = "pass" | "warn" | "fail";

export interface EvalRun {
  id: string;
  question: string;
  expected: string;
  retrieved: string;
  score: number;
  status: EvalStatus;
}

export interface LearnSection {
  id: string;
  step: string;
  title: string;
  text: string;
  visual: LearnVisual;
}

export type LearnVisual =
  | { kind: "documents"; items: string[] }
  | { kind: "chunks"; size: number; overlap: number; total: number }
  | { kind: "embeddings"; samples: { text: string; vector: number[] }[] }
  | { kind: "vector-search"; query: string; points: { label: string; distance: number }[] }
  | { kind: "context"; window: number; chunks: string[] }
  | { kind: "generation"; prompt: string; answer: string };
