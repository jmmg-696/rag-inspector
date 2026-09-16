import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, FlaskConical } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import {
  PipelineStep,
  type StepState,
} from "../components/pipeline/PipelineStep";
import { QueryInput } from "../components/query/QueryInput";
import { useI18n } from "../hooks/useI18n";
import { usePipelineStages } from "../hooks/usePipelineStages";
import { errorKeysFor } from "../lib/apiError";
import { buttonStyles } from "../lib/buttonStyles";
import { ApiError } from "../services/documentService";
import { retrievalService } from "../services/retrievalService";
import { mockQueryPipelineStages } from "../data/mockPipeline";
import { mockDefaultQuestion } from "../data/mockQueries";
import type { RetrievalHit, RetrievalSearchResponse } from "../types/domain";

const TOP_K = 5;

type Phase = "idle" | "running" | "done";

export default function PlaygroundPage() {
  const { t } = useI18n();
  const stages = usePipelineStages(mockQueryPipelineStages);
  const [question, setQuestion] = useState(mockDefaultQuestion);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<RetrievalSearchResponse | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [searchedOnce, setSearchedOnce] = useState(false);

  const handleRun = () => {
    setPhase("running");
    setResult(null);
    setErrorCode(null);
    retrievalService
      .search({
        query: question.trim(),
        topK: TOP_K,
        scoreThreshold: 0,
        documentId: null,
      })
      .then((response) => {
        setResult(response);
        setPhase("done");
        setSearchedOnce(true);
      })
      .catch((error: unknown) => {
        setResult(null);
        setErrorCode(error instanceof ApiError ? error.code : "unknown");
        setPhase("done");
      });
  };

  const handleReset = useCallback(() => {
    setPhase("idle");
    setResult(null);
    setErrorCode(null);
  }, []);

  const stageState = (index: number): StepState => {
    if (phase === "idle") return "idle";
    if (phase === "running") {
      if (index === 0) return "done";
      if (index === 1) return "running";
      return "idle";
    }
    if (errorCode) {
      if (index === 0) return "done";
      return "idle";
    }
    if (result && result.totalResults > 0) {
      return index <= 3 ? "done" : "idle";
    }
    return index <= 2 ? "done" : "idle";
  };

  const hits = result?.results ?? [];
  const noCorpus = result !== null && result.corpusSize === 0;
  const noResults =
    result !== null && result.corpusSize > 0 && result.totalResults === 0;
  const modelLoadingFirst = phase === "running" && !searchedOnce;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("playground.title")}
        description={t("playground.description")}
        badge={
          <StatusBadge
            label={t("retrieval.liveBadge")}
            tone="accent"
            pulse={phase === "running"}
          />
        }
        actions={
          phase !== "idle" ? (
            <Button variant="secondary" onClick={handleReset}>
              {t("playground.newRun")}
            </Button>
          ) : undefined
        }
      />

      <QueryInput
        value={question}
        onChange={setQuestion}
        onSubmit={handleRun}
        busy={phase === "running"}
      />

      {phase === "idle" ? (
        <EmptyState
          icon={FlaskConical}
          title={t("playground.empty.title")}
          description={t("playground.empty.body")}
        />
      ) : (
        <div
          id="pipeline-run"
          className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start"
        >
          <Card title={t("playground.run.title")}>
            <div className="space-y-2.5 p-4 sm:p-5">
              <p className="truncate border-b border-line pb-3 font-mono text-[11px] text-faint">
                {t("playground.questionEcho", { question })}
              </p>
              {stages.map((stage, index) => (
                <PipelineStep
                  key={stage.id}
                  stage={stage}
                  orientation="vertical"
                  state={stageState(index)}
                  index={index}
                  total={stages.length}
                />
              ))}
              {modelLoadingFirst && (
                <p className="pt-1 font-mono text-[11px] text-accent">
                  {t("retrieval.stage.loadingModel")}
                </p>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            {errorCode && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger-soft px-5 py-4"
              >
                <AlertTriangle size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {t("playground.retrievalError")}{" "}
                    {t(errorKeysFor(errorCode).titleKey)}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {t(errorKeysFor(errorCode).bodyKey)}
                  </p>
                </div>
              </div>
            )}

            {noCorpus && (
              <EmptyState
                icon={FlaskConical}
                title={t("playground.noCorpus.title")}
                description={t("playground.noCorpus.body")}
                action={
                  <Link to="/documents" className={buttonStyles("primary")}>
                    {t("emptyPipeline.upload")}
                  </Link>
                }
              />
            )}

            {noResults && (
              <Card title={t("playground.retrievalComplete")}>
                <div className="px-5 py-5 text-sm text-muted sm:px-6">
                  {t("retrieval.noResults.title")}{" "}
                  {t("retrieval.noResults.body")}
                </div>
              </Card>
            )}

            {hits.length > 0 && (
              <>
                <Card title={t("playground.retrievalComplete")}>
                  <div className="space-y-3 px-5 py-5 sm:px-6">
                    <p className="text-sm text-ink">
                      {t("playground.chunksRetrieved", {
                        count: hits.length,
                      })}{" "}
                      · {t("playground.topResult")}:{" "}
                      <span className="font-mono font-semibold text-accent">
                        {hits[0].score.toFixed(4)}
                      </span>
                    </p>
                    <p className="font-mono text-[11px] text-faint">
                      {result?.queryEmbedding.model} ·{" "}
                      {t("embeddings.dimensionsValue", {
                        count: String(result?.queryEmbedding.dimensions ?? 0),
                      })}{" "}
                      · Qdrant
                    </p>
                  </div>
                </Card>

                <Card title={t("playground.contextTitle")}>
                  <ul className="divide-y divide-line">
                    {hits.slice(0, 3).map((hit: RetrievalHit) => (
                      <li key={hit.pointId} className="px-5 py-4 sm:px-6">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-sm font-medium text-ink">
                            {hit.documentName}
                          </p>
                          <p className="font-mono text-[11px] text-accent">
                            {t("retrieval.cosineSimilarity")}{" "}
                            {hit.score.toFixed(4)} · #
                            {hit.rank}
                          </p>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">
                          {hit.text.length > 260
                            ? `${hit.text.slice(0, 260)}…`
                            : hit.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title={t("playground.llmPendingTitle")}>
                  <div className="space-y-3 px-5 py-5 sm:px-6">
                    <p className="text-sm leading-relaxed text-muted">
                      {t("playground.llmPendingBody")}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge label="LLM · Phase 5" tone="neutral" />
                      <StatusBadge label={t("playground.answerPhase5")} tone="neutral" />
                      <Link
                        to="/retrieval"
                        className="ml-auto text-sm font-medium text-accent underline-offset-4 hover:underline"
                      >
                        {t("retrieval.title")} →
                      </Link>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
