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

export interface CleaningStats {
  originalCharacters: number;
  cleanedCharacters: number;
  removedArtifacts: number;
}

export interface DocumentSummary {
  id: string;
  name: string;
  type: string;
  pageCount: number;
  characters: number;
  words: number;
  status: string;
  chunkSize: number;
  chunkOverlap: number;
  chunkCount: number;
  cleaning: CleaningStats;
  createdAt: string;
}

export interface DocumentPageText {
  page: number;
  text: string;
  characters: number;
}

export interface DocumentDetail extends DocumentSummary {
  pages: DocumentPageText[];
}

export interface ChunkRecord {
  id: string;
  documentId: string;
  index: number;
  text: string;
  pageStart: number;
  pageEnd: number;
  characterCount: number;
  estimatedTokens: number;
}

export interface ChunksResponse {
  documentId: string;
  chunkSize: number;
  chunkOverlap: number;
  charactersPerToken: number;
  total: number;
  chunks: ChunkRecord[];
}

export const CHUNK_SIZES = [128, 256, 512, 1024] as const;
export const CHUNK_OVERLAPS = [0, 50, 100, 200] as const;

export type StageIconKey =
  | "documents"
  | "chunking"
  | "embeddings"
  | "vector-store"
  | "retrieval"
  | "context"
  | "llm"
  | "answer"
  | "question";

export type StageStatus = "done" | "current" | "upcoming";

export interface PipelineStage {
  id: string;
  label: string;
  icon: StageIconKey;
  description: string;
  detail: string;
  status?: StageStatus;
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
  | { kind: "generation"; answer: string };
