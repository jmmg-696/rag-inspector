import { request } from "./http";
import type {
  EmbeddingModelMeta,
  SemanticSpace,
  VectorDetail,
  VectorPointList,
  VectorStats,
  VectorStatus,
} from "../types/domain";

export interface EmbeddingPreview {
  chunkId: string;
  pointId: string;
  documentId: string;
  model: string;
  dimensions: number;
  vectorPreview: number[];
  status: string;
}

export const embeddingService = {
  model(): Promise<EmbeddingModelMeta> {
    return request<EmbeddingModelMeta>("/api/embeddings/model");
  },

  preview(documentId: string, chunkIndex: number): Promise<EmbeddingPreview> {
    return request<EmbeddingPreview>("/api/embeddings/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, chunkIndex }),
    });
  },
};

export const vectorStoreService = {
  status(): Promise<VectorStatus> {
    return request<VectorStatus>("/api/vectors/status");
  },

  stats(): Promise<VectorStats> {
    return request<VectorStats>("/api/vectors/stats");
  },

  points(limit = 100): Promise<VectorPointList> {
    return request<VectorPointList>(`/api/vectors/points?limit=${limit}`);
  },

  point(pointId: string): Promise<VectorDetail> {
    return request<VectorDetail>(`/api/vectors/points/${pointId}`);
  },

  semanticSpace(): Promise<SemanticSpace> {
    return request<SemanticSpace>("/api/vectors/semantic-space");
  },
};
