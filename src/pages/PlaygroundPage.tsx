import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { PipelineStep, type StepState } from "../components/pipeline/PipelineStep";
import { QueryInput } from "../components/query/QueryInput";
import { SourceCard } from "../components/sources/SourceCard";
import { getRagRun } from "../data/mockPlaygroundRun";
import { mockQueryPipelineStages } from "../data/mockPipeline";
import { mockDefaultQuestion } from "../data/mockQueries";
import { useI18n } from "../hooks/useI18n";
import { usePipelineStages } from "../hooks/usePipelineStages";
import type { RagRunResult } from "../types/domain";

type RunPhase = "idle" | "running" | "done";

const STEP_DURATIONS_MS = [420, 380, 460, 360, 900, 420];

export default function PlaygroundPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const stages = usePipelineStages(mockQueryPipelineStages);
  const [question, setQuestion] = useState(mockDefaultQuestion);
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<RagRunResult | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const handleRun = () => {
    clearTimers();
    setResult(getRagRun(question));
    setStep(0);
    setPhase("running");
    let elapsed = 0;
    STEP_DURATIONS_MS.forEach((duration, i) => {
      elapsed += duration;
      const id = window.setTimeout(() => {
        if (i === STEP_DURATIONS_MS.length - 1) {
          setPhase("done");
        }
        setStep(i + 1);
      }, elapsed);
      timersRef.current.push(id);
    });
    requestAnimationFrame(() => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document
          .getElementById("pipeline-run")
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  };

  const handleReset = () => {
    clearTimers();
    setPhase("idle");
    setStep(0);
    setResult(null);
  };

  const stageState = (index: number): StepState => {
    if (phase === "idle") return "idle";
    if (phase === "done") return "done";
    if (index < step) return "done";
    if (index === step) return "running";
    return "idle";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("playground.title")}
        description={t("playground.description")}
        badge={<StatusBadge label={t("common.demoRun")} tone="accent" />}
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
            </div>
          </Card>

          {phase === "done" && result ? (
            <div className="space-y-4">
              <Card title={t("playground.answer.title")}>
                <div className="px-5 py-5 sm:px-6">
                  <p className="text-base leading-relaxed text-ink">
                    {result.answer.text}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                    <StatusBadge label={result.answer.model} tone="neutral" />
                    <span className="font-mono text-[11px] text-faint">
                      {t("playground.answer.meta", {
                        latency: result.answer.latencyMs,
                        chunks: result.sources.length + 1,
                      })}
                    </span>
                  </div>
                </div>
              </Card>

              <div>
                <h2 className="text-sm font-semibold tracking-tight text-ink">
                  {t("playground.sources.title")}
                </h2>
                <p className="mt-0.5 text-sm text-muted">
                  {t("playground.sources.hint")}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {result.sources.map((source, index) => (
                    <SourceCard
                      key={source.id}
                      source={source}
                      index={index}
                      onOpen={() => navigate("/retrieval")}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card title={t("playground.processing")}>
              <div className="px-5 py-10 text-center sm:px-6">
                <p className="animate-pulse font-mono text-xs uppercase tracking-widest text-faint">
                  {t("playground.processingHint")}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
