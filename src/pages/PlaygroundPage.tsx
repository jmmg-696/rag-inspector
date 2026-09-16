import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  CircleAlert,
  Cpu,
  FlaskConical,
  Square,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CitationText } from "../components/generation/CitationText";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { PromptInspector } from "../components/generation/PromptInspector";
import { QueryInput } from "../components/query/QueryInput";
import { RunInspector } from "../components/generation/RunInspector";
import { SourceCards } from "../components/generation/SourceCards";
import { StatusBadge } from "../components/ui/StatusBadge";
import { PipelineStep, type StepState } from "../components/pipeline/PipelineStep";
import { InfoTooltip } from "../components/ui/InfoTooltip";
import { EducationalCallout } from "../components/ui/EducationalCallout";
import { useI18n } from "../hooks/useI18n";
import { usePipelineStages } from "../hooks/usePipelineStages";
import { errorKeysFor } from "../lib/apiError";
import { generationService, llmService } from "../services/generationService";
import type { GenerationParams } from "../services/generationService";
import { mockQueryPipelineStages } from "../data/mockPipeline";
import { mockDefaultQuestion } from "../data/mockQueries";
import type { GenerationResponse, LlmStatus } from "../types/domain";

const TOP_K = 5;
const STAGES = ["question", "embeddings", "retrieval", "context", "prompt", "llm", "answer", "sources"] as const;

type Phase = "idle" | "running" | "done" | "error";

export default function PlaygroundPage() {
  const { t } = useI18n();
  const location = useLocation();
  const stages = usePipelineStages(mockQueryPipelineStages);
  const incoming = (location.state ?? null) as { query?: string } | null;

  const [question, setQuestion] = useState(
    incoming?.query?.trim() || mockDefaultQuestion
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [answerStream, setAnswerStream] = useState("");
  const [result, setResult] = useState<GenerationResponse | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [llm, setLlm] = useState<LlmStatus | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.2);
  const [highlightedSource, setHighlightedSource] = useState<string | null>(
    null
  );
  const [lastParams, setLastParams] = useState<GenerationParams | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    llmService
      .status()
      .then((status) => {
        setLlm(status);
        setModel((prev) =>
          prev ??
          (status.modelAvailable
            ? status.configuredModel
            : status.models[0] ?? status.configuredModel)
        );
      })
      .catch(() => setLlm(null));
    return () => abortRef.current?.abort();
  }, []);

  const runGeneration = (params: GenerationParams) => {
    setLastParams(params);
    setPhase("running");
    setResult(null);
    setErrorCode(null);
    setAnswerStream("");
    setHighlightedSource(null);
    setProgress(1);
    const controller = new AbortController();
    abortRef.current = controller;
    generationService
      .stream(params, (event) => {
        switch (event.type) {
          case "stage":
            if (event.stage === "building_context") setProgress(3);
            else if (event.stage === "building_prompt") setProgress(4);
            else if (event.stage === "generating") setProgress(5);
            break;
          case "token":
            setAnswerStream((prev) => prev + event.text);
            break;
          case "result":
            setResult(event.payload);
            setProgress(STAGES.length);
            setPhase("done");
            break;
          case "error":
            setErrorCode(event.code);
            setPhase("error");
            break;
          case "retrieval":
            setProgress(2);
            break;
        }
      }, controller.signal)
      .then(() => {
        if (controller.signal.aborted) {
          setErrorCode("cancelled");
          setPhase("error");
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          setErrorCode("cancelled");
        } else {
          setErrorCode(error instanceof Error && error.message !== "unknown"
            ? error.message
            : "unknown");
        }
        setPhase("error");
      });
  };

  const handleRun = () => {
    if (!question.trim()) return;
    runGeneration({
      query: question.trim(),
      topK: TOP_K,
      scoreThreshold: 0,
      documentId: null,
      model,
      temperature,
    });
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    setPhase("idle");
    setResult(null);
    setErrorCode(null);
    setAnswerStream("");
    setProgress(0);
  }, []);

  const stageState = (index: number): StepState => {
    if (phase === "idle") return "idle";
    if (phase === "error") return index < progress ? "done" : "idle";
    if (phase === "done") return "done";
    if (index < progress) return "done";
    if (index === progress) return "running";
    return "idle";
  };

  const llmBroken = llm !== null && (!llm.available || !llm.modelAvailable);
  const errorMeta = errorCode ? errorKeysFor(errorCode) : null;
  const noDocuments = errorCode === "no_indexed_documents";
  const answer = result?.answer ?? null;
  const showStreamedAnswer =
    phase === "running" && progress >= 5 && answerStream.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("playground.title")}
        description={t("playground.description")}
        badge={
          <StatusBadge
            label={t("playground.llmChip")}
            tone={llmBroken ? "danger" : "success"}
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

      {llm && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3 shadow-sm">
          <span className="flex items-center gap-2">
            <Cpu
              size={14}
              aria-hidden="true"
              className={llmBroken ? "text-danger" : "text-success"}
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {llmBroken
                ? t("playground.localLlmUnavailable")
                : t("playground.localLlmReady")}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
              {t("playground.model")}
            </span>
            {llm.models.length > 0 ? (
              <select
                value={model ?? ""}
                onChange={(event) => setModel(event.target.value)}
                aria-label={t("playground.model")}
                className="h-7 rounded-md border border-line bg-surface px-2 font-mono text-xs text-ink"
              >
                <option
                  value={llm.configuredModel}
                  disabled={!llm.models.includes(llm.configuredModel)}
                >
                  {llm.configuredModel} · {t("playground.modelDefault")}
                </option>
                {llm.models
                  .filter((name) => name !== llm.configuredModel)
                  .map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
              </select>
            ) : (
              <span className="font-mono text-xs text-ink">
                {llm.configuredModel}
              </span>
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-faint">
              {t("playground.temperature")}
              <InfoTooltip body={t("playground.temperatureInfo")} />
            </span>
            <input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (Number.isFinite(next)) {
                  setTemperature(Math.min(2, Math.max(0, next)));
                }
              }}
              className="h-7 w-16 rounded-md border border-line bg-surface px-2 font-mono text-xs text-ink"
            />
          </span>
        </div>
      )}

      {llmBroken && llm && (
        <p className="rounded-lg border border-warning/40 bg-warning-soft px-4 py-3 text-sm leading-relaxed text-muted">
          {t("playground.llmUnavailableBody")}{" "}
          {llm.modelAvailable ? (
            <span className="font-mono text-[11px]">ollama serve</span>
          ) : (
            <span className="font-mono text-[11px]">
              {t("playground.llmHint", { model: llm.configuredModel })}
            </span>
          )}
        </p>
      )}

      <QueryInput
        value={question}
        onChange={setQuestion}
        onSubmit={handleRun}
        busy={phase === "running"}
      />

      {phase === "running" && (
        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleStop} className="h-8 px-3 text-xs">
            <Square size={11} aria-hidden="true" />
            {t("playground.stop")}
          </Button>
        </div>
      )}

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
            </div>
          </Card>

          <div className="space-y-4">
            {phase === "error" && errorMeta && (
              <div
                role="alert"
                className="flex flex-wrap items-start gap-3 rounded-xl border border-danger/40 bg-danger-soft px-5 py-4"
              >
                <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    {t("playground.retrievalError")} {t(errorMeta.titleKey)}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">
                    {t(errorMeta.bodyKey)}
                  </p>
                  {errorCode === "llm_model_not_found" && llm && (
                    <p className="mt-1 font-mono text-[11px] text-faint">
                      ollama pull {model ?? llm.configuredModel}
                    </p>
                  )}
                </div>
                {!noDocuments && lastParams && (
                  <Button
                    variant="secondary"
                    onClick={() => runGeneration(lastParams)}
                  >
                    {t("common.retry")}
                  </Button>
                )}
                {noDocuments && (
                  <Link
                    to="/documents"
                    className="inline-flex h-9 items-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-strong dark:text-[#0b0d10]"
                  >
                    {t("emptyPipeline.upload")}
                  </Link>
                )}
              </div>
            )}

            {(phase === "running" || phase === "done") &&
              progress >= 5 && (
                <Card title={t("playground.answer.title")}>
                  <div className="px-5 py-5 sm:px-6">
                    {answer ? (
                      <CitationText
                        text={answer}
                        sources={result?.context.sources ?? []}
                        onSourceClick={(source) => {
                          setHighlightedSource(source.sourceId);
                          document
                            .getElementById(`source-${source.sourceId}`)
                            ?.scrollIntoView({ block: "nearest" });
                        }}
                      />
                    ) : showStreamedAnswer ? (
                      <p
                        aria-live="polite"
                        className="text-base leading-relaxed text-ink"
                      >
                        {answerStream}
                        <span
                          className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-accent align-middle"
                          aria-hidden="true"
                        />
                      </p>
                    ) : phase === "running" ? (
                      <p className="font-mono text-xs text-accent">
                        {t("playground.generating", {
                          model: model ?? llm?.configuredModel ?? "…",
                        })}
                      </p>
                    ) : (
                      <p className="text-sm text-muted">
                        {t("playground.answer.empty")}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                      <StatusBadge
                        label={
                          result
                            ? `${result.model || model || ""} · ${t("playground.llmChip")}`
                            : (model ?? "")
                        }
                        tone="neutral"
                      />
                      <span className="text-xs leading-relaxed text-muted">
                        {t("playground.answer.groundingNote")}
                      </span>
                    </div>
                    {result && answer && result.citations.verified.length === 0 && (
                      <p className="mt-3 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning-soft px-3.5 py-2.5 text-xs leading-relaxed text-muted">
                        <CircleAlert
                          size={13}
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-warning"
                        />
                        {t("playground.answer.noCitation")}
                      </p>
                    )}
                    {result && result.citations.unresolved.length > 0 && (
                      <p className="mt-3 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger-soft px-3.5 py-2.5 text-xs leading-relaxed text-muted">
                        <CircleAlert
                          size={13}
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-danger"
                        />
                        {t("playground.sources.unresolvedBody", {
                          numbers: result.citations.unresolved
                            .map((n) => `[SOURCE_${n}]`)
                            .join(", "),
                        })}
                      </p>
                    )}
                  </div>
                </Card>
              )}

            {result && result.context.sources.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-ink">
                  {t("playground.sources.title")}
                </h2>
                <div className="mt-3">
                  <SourceCards
                    sources={result.context.sources}
                    highlightedSource={highlightedSource}
                  />
                </div>
              </div>
            )}

            {result && result.context.sources.length > 0 && (
              <PromptInspector prompt={result.prompt} />
            )}
            {result && <RunInspector run={result} />}

            <EducationalCallout
              title={t("playground.ragVsGen.title")}
              body={t("playground.ragVsGen.body")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
