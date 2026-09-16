import type { ChunksResponse, DocumentDetail, DocumentSummary } from "../types/domain";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status = 0) {
    super(`API error: ${code} (${status})`);
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    throw new ApiError("network", 0);
  }
  if (!response.ok) {
    let code = "unknown";
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "detail" in body) {
        const detail = (body as { detail: unknown }).detail;
        if (
          detail &&
          typeof detail === "object" &&
          "code" in detail &&
          typeof (detail as { code: unknown }).code === "string"
        ) {
          code = (detail as { code: string }).code;
        }
      } else if (response.status === 404) {
        code = "not_found";
      }
    } catch {
      /* body unreadable */
    }
    throw new ApiError(code, response.status);
  }
  return (await response.json()) as T;
}

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
  async health(): Promise<boolean> {
    try {
      const result = await request<{ status: string }>("/api/health");
      return result.status === "ok";
    } catch {
      return false;
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
    return request<{ deleted: boolean }>(
      `/api/documents/${documentId}`,
      { method: "DELETE" }
    );
  },
};
