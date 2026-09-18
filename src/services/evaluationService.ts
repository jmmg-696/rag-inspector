import { request } from "./http";
import type { EvalDataset, EvalRun } from "../types/domain";

export interface EvaluationRunParams {
  topK: number;
  scoreThreshold: number;
  generateAnswers: boolean;
  model: string | null;
  temperature: number | null;
}

export const evaluationService = {
  dataset(): Promise<EvalDataset> {
    return request<EvalDataset>("/api/evaluation/dataset");
  },

  run(params: EvaluationRunParams): Promise<EvalRun> {
    return request<EvalRun>("/api/evaluation/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topK: params.topK,
        scoreThreshold: params.scoreThreshold,
        generateAnswers: params.generateAnswers,
        model: params.model,
        temperature: params.temperature,
      }),
    });
  },
};
