import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { EvalRun, EvalRunRecord } from "../types/domain";

const HISTORY_KEY = "rag-inspector:eval-runs";
const MAX_RUNS = 6;

export function toRecord(run: EvalRun): EvalRunRecord {
  return {
    runId: run.runId,
    createdAt: run.createdAt,
    datasetName: run.dataset.name,
    evaluatedCases: run.dataset.evaluatedCases,
    skippedCases: run.dataset.skippedCases,
    topK: run.configuration.topK,
    scoreThreshold: run.configuration.scoreThreshold,
    generationEnabled: run.configuration.generationEnabled,
    llmModel: run.configuration.llmModel,
    retrievalMetrics: run.retrievalMetrics,
    citationCoverage: run.generationMetrics?.citationCoverage ?? null,
    validCitationRate: run.generationMetrics?.validCitationRate ?? null,
    generatedAnswers: run.generationMetrics?.generatedAnswers ?? 0,
  };
}

export function useEvaluationHistory() {
  const [records, setRecords] = useLocalStorage<EvalRunRecord[]>(
    HISTORY_KEY,
    []
  );

  const addRun = useCallback(
    (run: EvalRun) => {
      setRecords((prev) => [toRecord(run), ...prev].slice(0, MAX_RUNS));
    },
    [setRecords]
  );

  const removeRun = useCallback(
    (runId: string) => {
      setRecords((prev) => prev.filter((record) => record.runId !== runId));
    },
    [setRecords]
  );

  const clear = useCallback(() => setRecords([]), [setRecords]);

  return { records, addRun, removeRun, clear };
}
