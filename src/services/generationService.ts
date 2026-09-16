import { request } from "./http";
import type { GenerationEvent, GenerationResponse, LlmStatus } from "../types/domain";

export interface GenerationParams {
  query: string;
  topK: number;
  scoreThreshold: number;
  documentId: string | null;
  model: string | null;
  temperature: number;
}

function toBody(params: GenerationParams) {
  return JSON.stringify({
    query: params.query,
    topK: params.topK,
    scoreThreshold: params.scoreThreshold,
    documentId: params.documentId,
    model: params.model,
    temperature: params.temperature,
  });
}

export const llmService = {
  status(): Promise<LlmStatus> {
    return request<LlmStatus>("/api/llm/status");
  },
};

export const generationService = {
  generate(params: GenerationParams): Promise<GenerationResponse> {
    return request<GenerationResponse>("/api/generation/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: toBody(params),
    });
  },

  /**
   * NDJSON event stream (stage / retrieval / token / result / error).
   * Stages reflect what the backend is actually doing, token by token.
   */
  async stream(
    params: GenerationParams,
    onEvent: (event: GenerationEvent) => void,
    signal: AbortSignal
  ): Promise<void> {
    const response = await fetch("/api/generation/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: toBody(params),
      signal,
    });
    if (!response.ok) {
      let code = "unknown";
      try {
        const body: unknown = await response.json();
        if (
          body &&
          typeof body === "object" &&
          "detail" in body &&
          body.detail &&
          typeof body.detail === "object" &&
          "code" in body.detail
        ) {
          code = String((body.detail as { code: unknown }).code);
        }
      } catch {
        /* unreadable */
      }
      throw new Error(code);
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("unknown");
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        onEvent(JSON.parse(line) as GenerationEvent);
      }
    }
    if (buffer.trim()) {
      onEvent(JSON.parse(buffer) as GenerationEvent);
    }
  },
};
