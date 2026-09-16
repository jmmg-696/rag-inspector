import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { GenerationResponse } from "../../types/domain";
import { formatChunkCount } from "../../lib/format";
import { Card } from "../ui/Card";
import { cn } from "../../lib/cn";

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
        {label}
      </span>
      <span className="text-right font-mono text-xs text-ink">{value}</span>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="text-sm font-semibold tracking-tight text-ink">{title}</p>
      <div className="mt-1 divide-y divide-line/60">{children}</div>
    </section>
  );
}

export function RunInspector({ run }: { run: GenerationResponse }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  const metrics = run.generationMetrics;

  const seconds = (ms?: number) =>
    ms === undefined
      ? "—"
      : ms >= 1000
        ? t("playground.run.s", { s: (ms / 1000).toFixed(1) })
        : t("playground.run.ms", { ms });

  return (
    <Card
      title={t("playground.runInspector.title")}
      actions={
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition-colors hover:bg-elevated hover:text-ink"
        >
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={cn("transition-transform", open && "rotate-180")}
          />
        </button>
      }
    >
      {open && (
        <div className="grid gap-x-8 gap-y-5 px-5 py-5 sm:px-6 lg:grid-cols-2">
          <Group title={t("playground.run.query")}>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {run.query}
            </p>
          </Group>
          <Group title={t("playground.run.retrieval")}>
            <Line
              label={t("playground.run.topK")}
              value={String(run.retrieval.topK)}
            />
            <Line
              label={t("playground.run.results")}
              value={String(run.retrieval.totalResults)}
            />
            <Line
              label={t("playground.run.corpus")}
              value={formatChunkCount(run.retrieval.corpusSize)}
            />
            <Line
              label={t("playground.run.retrievalTime")}
              value={seconds(run.retrieval.retrievalMs)}
            />
          </Group>
          <Group title={t("playground.run.context")}>
            <Line
              label={t("playground.run.retrieved")}
              value={String(run.context.retrievedChunks)}
            />
            <Line
              label={t("playground.run.included")}
              value={String(run.context.includedChunks)}
            />
            <Line
              label={t("playground.run.estimated")}
              value={formatChunkCount(run.context.estimatedTokens)}
            />
          </Group>
          <Group title={t("playground.run.generation")}>
            <Line label={t("playground.run.model")} value={run.model || "—"} />
            <Line
              label={t("playground.run.temperature")}
              value={run.temperature.toFixed(1)}
            />
            <Line
              label={t("playground.run.generationTime")}
              value={
                metrics?.elapsedMs !== undefined
                  ? seconds(metrics.elapsedMs)
                  : t("playground.run.notReported")
              }
            />
            <Line
              label={t("playground.run.completionTokens")}
              value={
                metrics?.completionTokens !== undefined
                  ? String(metrics.completionTokens)
                  : t("playground.run.notReported")
              }
            />
            <Line
              label={t("playground.run.promptTokens")}
              value={
                metrics?.promptTokens !== undefined
                  ? String(metrics.promptTokens)
                  : t("playground.run.notReported")
              }
            />
            <Line
              label={t("playground.run.tokensPerSecond")}
              value={
                metrics?.tokensPerSecond !== undefined
                  ? String(metrics.tokensPerSecond)
                  : t("playground.run.notReported")
              }
            />
          </Group>
        </div>
      )}
    </Card>
  );
}
