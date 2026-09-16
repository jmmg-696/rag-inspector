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

export type PipelineStatus =
  | "uploaded"
  | "extracting"
  | "cleaning"
  | "chunking"
  | "embedding"
  | "indexing"
  | "ready"
  | "error";

export const ACTIVE_PIPELINE_STATUSES: PipelineStatus[] = [
  "uploaded",
  "extracting",
  "cleaning",
  "chunking",
  "embedding",
  "indexing",
];

export interface DocumentSummary {
  id: string;
  name: string;
  type: string;
  pageCount: number;
  characters: number;
  words: number;
  status: PipelineStatus;
  chunkSize: number;
  chunkOverlap: number;
  chunkCount: number;
  embeddingCount: number;
  embeddingVersion: string;
  indexedAt: string;
  errorCode: string;
  errorMessage: string;
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

export interface HealthInfo {
  api: string;
  qdrant: string;
  embeddingModel: string;
}

export interface EmbeddingModelMeta {
  model: string;
  provider: string;
  device: string;
  dimensions: number | null;
  status: string;
}

export interface VectorStatus {
  connected: boolean;
  collection: string;
  vectors: number;
  dimensions: number | null;
  distance: string;
  errorCode: string;
}

export interface VectorStats {
  vectors: number;
  dimensions: number | null;
  documents: number;
  totalChunks: number;
  embeddedChunks: number;
  indexedPercent: number;
  averageChunksPerDocument: number;
}

export interface VectorPoint {
  id: string;
  documentId: string;
  documentName: string;
  chunkId: string;
  chunkIndex: number;
  pageStart: number;
  pageEnd: number;
  estimatedTokens: number;
}

export interface VectorPointList {
  total: number;
  points: VectorPoint[];
}

export interface VectorDetail extends VectorPoint {
  text: string;
  dimensions: number;
  vector: number[];
}

export interface SpacePoint {
  pointId: string;
  x: number;
  y: number;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  pageStart: number;
}

export interface SemanticSpace {
  method: string;
  dimensions: number;
  points: SpacePoint[];
}

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
