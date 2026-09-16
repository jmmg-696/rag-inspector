import { request } from "./http";
import type {
  ChunksResponse,
  DocumentDetail,
  DocumentSummary,
  HealthInfo,
} from "../types/domain";

export interface IngestSettings {
  chunkSize: number;
  chunkOverlap: number;
}

function toChunkParams(settings: IngestSettings) {
  return new URLSearchParams({
    chunk_size: String(settings.chunkSize),
    chunk_overlap: String(settings.chunkOverlap),
  });
}

export const documentService = {
  async health(): Promise<HealthInfo | null> {
    try {
      return await request<HealthInfo>("/api/health");
    } catch {
      return null;
    }
  },

  list(): Promise<DocumentSummary[]> {
    return request<DocumentSummary[]>("/api/documents");
  },

  get(documentId: string): Promise<DocumentDetail> {
    return request<DocumentDetail>(`/api/documents/${documentId}`);
  },

  chunks(documentId: string, settings: IngestSettings): Promise<ChunksResponse> {
    return request<ChunksResponse>(
      `/api/documents/${documentId}/chunks?${toChunkParams(settings)}`
    );
  },

  reindex(documentId: string): Promise<DocumentSummary> {
    return request<DocumentSummary>(`/api/documents/${documentId}/embed`, {
      method: "POST",
    });
  },

  ingest(file: File, settings: IngestSettings): Promise<DocumentSummary> {
    const form = new FormData();
    form.append("file", file);
    form.append("chunk_size", String(settings.chunkSize));
    form.append("chunk_overlap", String(settings.chunkOverlap));
    return request<DocumentSummary>("/api/documents/ingest", {
      method: "POST",
      body: form,
    });
  },

  remove(documentId: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/api/documents/${documentId}`, {
      method: "DELETE",
    });
  },
};

export { ApiError } from "./http";
