import { request } from "./http";
import type { RetrievalSearchResponse, RetrievalSpace } from "../types/domain";

export interface RetrievalParams {
  query: string;
  topK: number;
  scoreThreshold: number;
  documentId: string | null;
}

function toBody(params: RetrievalParams, includeEmbedding = false) {
  return JSON.stringify({
    query: params.query,
    topK: params.topK,
    scoreThreshold: params.scoreThreshold,
    documentId: params.documentId,
    includeEmbedding,
  });
}

export const retrievalService = {
  search(params: RetrievalParams): Promise<RetrievalSearchResponse> {
    return request<RetrievalSearchResponse>("/api/retrieval/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: toBody(params, true),
    });
  },

  semanticSpace(params: RetrievalParams): Promise<RetrievalSpace> {
    return request<RetrievalSpace>("/api/retrieval/semantic-space", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: toBody(params),
    });
  },
};
