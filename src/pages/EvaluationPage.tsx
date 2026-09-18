import {
  Activity,
  FlaskConical,
  Play,
  Quote,
  ScanSearch,
  Target,
  Timer,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { EducationalCallout } from "../components/ui/EducationalCallout";
import { EmptyState } from "../components/ui/EmptyState";
import { EvalCaseDetail } from "../components/evaluation/EvalCaseDetail";
import { EvalMatrix } from "../components/evaluation/EvalMatrix";
import { ExperimentsTable } from "../components/evaluation/ExperimentsTable";
import { InfoTooltip } from "../components/ui/InfoTooltip";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/Skeleton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { useEvaluationHistory } from "../hooks/useEvaluationHistory";
import { useI18n } from "../hooks/useI18n";
import { errorKeysFor } from "../lib/apiError";
import { formatChunkCount } from "../lib/format";
import { evaluationService } from "../services/evaluationService";
import { llmService } from "../services/generationService";
import type {
  EvalDataset,
  EvalRun,
  LlmStatus,
} from "../types/domain";

const THRESHOLDS = [0, 0.2, 0.4, 0.6, 0.8];

function pct(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

export default function EvaluationPage() {
  const { t } = useI18n();
  const [dataset, setDataset] = useState<EvalDataset | null>(null);
  const [backendOffline, setBackendOffline] = useState(false);
  const [phase, setPhase] = useState<"idle" | "running" | "done" | "error">(
    "idle"
  );
  const [run, setRun] = useState<EvalRun | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [topK, setTopK] = useState(5);
  const [threshold, setThreshold] = useState(0);
  const [generate, setGenerate] = useState(false);
  const [llm, setLlm] = useState<LlmStatus | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.2);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const { records, addRun, removeRun, clear } = useEvaluationHistory();

  useEffect(() => {
    evaluationService
      .dataset()
      .then(setDataset)
      .catch(() => setBackendOffline(true));
    llmService
      .status()
      .then((status) => {
        setLlm(status);
        setModel(
          status.modelAvailable ? status.configuredModel : status.models[0] ?? null
        );
      })
      .catch(() => undefined);
  }, []);

  const runEvaluation = useCallback(() => {
    setPhase("running");
    setErrorCode(null);
    setRun(null);
    evaluationService
      .run({
        topK,
        scoreThreshold: threshold,
        generateAnswers: generate,
        model: generate ? model : null,
        temperature: generate ? temperature : null,
      })
      .then((result) => {
        setRun(result);
        setSelectedCase(
          result.cases.find((item) => !item.skipped)?.questionId ?? null
        );
        addRun(result);
        setPhase("done");
      })
      .catch((error: unknown) => {
        setErrorCode(
          error instanceof Error && error.message !== "unknown"
            ? error.message
            : "unknown"
        );
        setPhase("error");
      });
  }, [addRun, generate, model, temperature, threshold, topK]);

  const evaluatedCases = useMemo(
    () => (run ? run.cases.filter((item) => !item.skipped) : []),
    [run]
  );
  const detailCase =
    evaluatedCases.find((item) => item.questionId === selectedCase) ??
    evaluatedCases[0] ??
    null;

  const errorMeta = errorCode ? errorKeysFor(errorCode) : null;

  if (backendOffline) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("evaluation.title")}
          description={t("evaluation.description")}
        />
        <EmptyState
          icon={FlaskConical}
          title={t("error.network.title")}
          description={t("error.network.body")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("evaluation.title")}
        description={t("evaluation.description")}
        badge={
          <StatusBadge label={t("evaluation.realBadge")} tone="accent" />
        }
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Card title={t("evaluation.dataset")}>
          <div className="space-y-3 px-5 py-4 sm:px-6">
            {dataset ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {dataset.name}
                  </p>
                  <StatusBadge
                    label={t("evaluation.questionCount", {
                      count: dataset.totalCases,
                    })}
                    tone="neutral"
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted">
                  {dataset.description}
                </p>
                <p className="rounded-md border border-line bg-canvas px-3 py-2 font-mono text-[11px] text-faint">
                  documents: {dataset.document} · anchors →{" "}
                  {t("evaluation.anchorExplainer")}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
                  examples/evaluation/
                </p>
              </>
            ) : (
              <>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-14" />
              </>
            )}
          </div>
        </Card>

        <Card title={t("evaluation.configuration")}>
          <div className="space-y-4 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex w-20 flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
                  {t("evaluation.topK")}
                </span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={topK}
                  onChange={(event) =>
                    setTopK(
                      Math.min(20, Math.max(1, Number(event.target.value) || 1))
                    )
                  }
                  className="h-9 rounded-md border border-line bg-surface px-2.5 font-mono text-sm text-ink"
                />
              </label>
              <label className="flex w-36 flex-col gap-1.5">
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
                  {t("evaluation.threshold")}
                  <InfoTooltip body={t("evaluation.thresholdInfo")} />
                </span>
                <select
                  value={threshold}
                  onChange={(event) => setThreshold(Number(event.target.value))}
                  className="h-9 rounded-md border border-line bg-surface px-2 font-mono text-sm text-ink"
                >
                  {THRESHOLDS.map((value) => (
                    <option key={value} value={value}>
                      {value.toFixed(2)}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                onClick={runEvaluation}
                disabled={phase === "running" || !dataset}
                className="h-9"
              >
                {phase === "running" ? (
                  t("evaluation.running")
                ) : (
                  <>
                    <Play size={14} aria-hidden="true" />
                    {t("evaluation.run")}
                  </>
                )}
              </Button>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={generate}
                onChange={(event) => setGenerate(event.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span className="flex items-center gap-1.5 text-sm text-ink">
                {t("evaluation.generateAnswers")}
                <InfoTooltip body={t("evaluation.generateInfo")} />
              </span>
            </label>

            {generate && (
              <div className="flex flex-wrap items-end gap-4 rounded-lg border border-line bg-canvas px-3.5 py-3">
                <label className="flex min-w-40 flex-1 flex-col gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
                    {t("playground.model")}
                  </span>
                  {llm && llm.models.length > 0 ? (
                    <select
                      value={model ?? ""}
                      onChange={(event) => setModel(event.target.value)}
                      className="h-8 rounded-md border border-line bg-surface px-2 font-mono text-xs text-ink"
                    >
                      {llm.models.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-mono text-[11px] text-faint">
                      {llm?.configuredModel ?? "—"}
                    </span>
                  )}
                </label>
                <label className="flex w-20 flex-col gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
                    {t("playground.temperature")}
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
                    className="h-8 rounded-md border border-line bg-surface px-2 font-mono text-xs text-ink"
                  />
                </label>
                <p className="w-full font-mono text-[10px] uppercase tracking-widest text-warning">
                  {t("evaluation.hardwareWarning")}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {phase === "running" && (
        <Card>
          <div className="flex items-center gap-3 px-5 py-5 sm:px-6">
            <span
              className="h-1.5 w-full max-w-60 animate-pulse rounded-full bg-accent/60"
              aria-hidden="true"
            />
            <p
              aria-live="polite"
              className="shrink-0 font-mono text-xs uppercase tracking-widest text-faint"
            >
              {generate
                ? t("evaluation.stage.generating")
                : t("evaluation.stage.retrieving")}
            </p>
          </div>
        </Card>
      )}

      {phase === "error" && errorMeta && (
        <div
          role="alert"
          className="flex flex-wrap items-start gap-3 rounded-xl border border-danger/40 bg-danger-soft px-5 py-4"
        >
          <p className="min-w-0 flex-1">
            <span className="text-sm font-semibold text-ink">
              {t(errorMeta.titleKey)}
            </span>{" "}
            <span className="text-sm text-muted">{t(errorMeta.bodyKey)}</span>
          </p>
          <Button variant="secondary" onClick={runEvaluation}>
            {t("common.retry")}
          </Button>
        </div>
      )}

      {phase === "done" && run && (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <MetricCard
              label={t("evaluation.hitRate") + ` @${run.configuration.topK}`}
              value={pct(run.retrievalMetrics.hitRateAtK)}
              hint={t("evaluation.hitRateDef")}
              icon={<Activity size={16} />}
            />
            <MetricCard
              label={t("evaluation.recall") + ` @${run.configuration.topK}`}
              value={pct(run.retrievalMetrics.recallAtK)}
              hint={t("evaluation.recallDef")}
              icon={<Target size={16} />}
            />
            <MetricCard
              label={t("evaluation.precision") + ` @${run.configuration.topK}`}
              value={pct(run.retrievalMetrics.precisionAtK)}
              hint={t("evaluation.precisionDef")}
              icon={<ScanSearch size={16} />}
            />
            <MetricCard
              label="MRR"
              value={run.retrievalMetrics.mrr.toFixed(2)}
              hint={t("evaluation.mrrDef")}
              icon={<Timer size={16} />}
            />
          </div>

          {run.generationMetrics && (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <MetricCard
                label={t("evaluation.citationCoverage")}
                value={
                  run.generationMetrics.citationCoverage === null
                    ? "—"
                    : pct(run.generationMetrics.citationCoverage)
                }
                hint={t("evaluation.citationCoverageDef")}
                icon={<Quote size={16} />}
              />
              <MetricCard
                label={t("evaluation.validCitationRate")}
                value={
                  run.generationMetrics.validCitationRate === null
                    ? "—"
                    : pct(run.generationMetrics.validCitationRate)
                }
                hint={t("evaluation.validCitationRateDef")}
                icon={<Quote size={16} />}
              />
              <MetricCard
                label={t("evaluation.generatedAnswers")}
                value={formatChunkCount(
                  run.generationMetrics.generatedAnswers
                )}
                hint={
                  run.generationMetrics.failedAnswers > 0
                    ? t("evaluation.failedAnswers", {
                        count: run.generationMetrics.failedAnswers,
                      })
                    : undefined
                }
                icon={<FlaskConical size={16} />}
              />
              {run.generationMetrics.avgGenerationMs !== null && (
                <MetricCard
                  label={t("evaluation.avgGenerationTime")}
                  value={`${Math.round(
                    (run.generationMetrics.avgGenerationMs ?? 0) / 1000
                  )} s`}
                  hint={
                    run.generationMetrics.avgTokensPerSecond !== null
                      ? `${run.generationMetrics.avgTokensPerSecond} tok/s`
                      : t("playground.run.notReported")
                  }
                  icon={<Timer size={16} />}
                />
              )}
            </div>
          )}

          {(run.dataset.skippedCases > 0 || run.warnings.length > 0) && (
            <div
              role="alert"
              className="rounded-xl border border-warning/40 bg-warning-soft px-5 py-4"
            >
              <p className="text-sm font-semibold text-ink">
                {t("evaluation.skippedWarning")} ({run.dataset.skippedCases})
              </p>
              <ul className="mt-1 space-y-0.5">
                {run.warnings.map((warning) => (
                  <li
                    key={warning.questionId}
                    className="font-mono text-[11px] text-muted"
                  >
                    {warning.questionId.toUpperCase()}: {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-start">
            <Card
              title={t("evaluation.matrixTitle")}
              description={t("evaluation.matrixHint")}
            >
              <div className="pt-1">
                <EvalMatrix
                  cases={run.cases}
                  topK={run.configuration.topK}
                  selectedId={detailCase?.questionId ?? null}
                  onSelect={setSelectedCase}
                />
              </div>
            </Card>
            <Card
              title={t("evaluation.caseDetail")}
              actions={
                <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
                  {run.runId}
                </span>
              }
            >
              <div className="px-5 py-4 sm:px-6">
                {detailCase && (
                  <EvalCaseDetail
                    key={detailCase.questionId}
                    caseResult={detailCase}
                    config={{
                      topK: run.configuration.topK,
                      scoreThreshold: run.configuration.scoreThreshold,
                    }}
                  />
                )}
              </div>
            </Card>
          </div>

          <Card
            title={t("evaluation.experiments")}
            actions={
              records.length > 0 ? (
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  {t("evaluation.clearHistory")}
                </button>
              ) : undefined
            }
          >
            <div className="pt-1">
              <ExperimentsTable records={records} onRemove={removeRun} />
            </div>
          </Card>
        </>
      )}

      <Card title={t("evaluation.methodology.title")}>
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <ol className="space-y-1.5 text-sm leading-relaxed text-muted">
            <li>{t("evaluation.methodology.step1")}</li>
            <li>{t("evaluation.methodology.step2")}</li>
            <li>{t("evaluation.methodology.step3")}</li>
            <li>{t("evaluation.methodology.step4")}</li>
            <li>{t("evaluation.methodology.step5")}</li>
            <li>{t("evaluation.methodology.step6")}</li>
          </ol>
          <EducationalCallout
            title={t("evaluation.honestyTitle")}
            body={t("evaluation.honestyBody")}
          />
          <p className="text-xs leading-relaxed text-faint">
            {t("evaluation.relevanceNote")}
          </p>
        </div>
      </Card>
    </div>
  );
}
