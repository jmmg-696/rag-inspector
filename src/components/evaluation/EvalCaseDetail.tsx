import { Link } from "react-router-dom";
import {
  CircleCheck,
  CircleAlert,
  Layers,
  Quote,
  ScanSearch,
  Square,
} from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { EvalCaseResult } from "../../types/domain";
import { EducationalCallout } from "../ui/EducationalCallout";
import { StatusBadge } from "../ui/StatusBadge";
import { SimilarityBar } from "../ui/SimilarityBar";
import { buttonStyles } from "../../lib/buttonStyles";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
        {label}
      </span>
      <span className="font-mono text-xs text-ink">{value}</span>
    </div>
  );
}

export function EvalCaseDetail({
  caseResult,
  config,
}: {
  caseResult: EvalCaseResult;
  config: { topK: number; scoreThreshold: number };
}) {
  const { t } = useI18n();
  const metrics = caseResult.metrics;
  const generation = caseResult.generation;

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
          {t("evaluation.question")} · {caseResult.questionId.toUpperCase()}
        </p>
        <p className="mt-1 text-sm font-medium text-ink">
          {caseResult.question}
        </p>
        {caseResult.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {caseResult.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line bg-canvas px-2 py-0.5 font-mono text-[10px] text-faint"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {caseResult.skipped ? (
        <p className="rounded-lg border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-muted">
          {t("evaluation.skippedWarning")}
        </p>
      ) : (
        <>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              {t("evaluation.expectedSources")}
            </p>
            <ul className="mt-1.5 space-y-1">
              {caseResult.expectedSources.map((source) => (
                <li
                  key={source.chunkId}
                  className="flex items-center gap-2 rounded-md border border-accent/40 bg-accent-soft/40 px-3 py-1.5 font-mono text-[11px] text-ink"
                >
                  <CircleCheck size={12} aria-hidden="true" className="text-accent" />
                  {t("embeddings.chunkLabel", { index: source.chunkIndex })} ·{" "}
                  {t("detail.chunk.page", { page: source.pageStart })}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              {t("evaluation.retrieved")}
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {caseResult.retrieved.map((item) => (
                <li
                  key={item.rank}
                  className="rounded-md border border-line bg-canvas px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] text-muted">
                      #{item.rank}
                    </span>
                    <span className="font-mono text-xs font-medium text-ink">
                      {item.score.toFixed(4)}
                    </span>
                    <SimilarityBar
                      value={Math.min(Math.max(item.score, 0), 1)}
                      tone={item.relevant ? "success" : "accent"}
                      className="w-16"
                    />
                    <span className="ml-auto flex items-center gap-1.5">
                      {item.relevant ? (
                        <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-success">
                          <CircleCheck size={11} aria-hidden="true" />
                          {t("evaluation.relevant")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-faint">
                          <Square size={9} aria-hidden="true" />
                          {t("evaluation.notAnnotated")}
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-faint">
                    {item.documentName} ·{" "}
                    {t("embeddings.chunkLabel", { index: item.chunkIndex })}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {item.text.length > 200
                      ? `${item.text.slice(0, 200)}…`
                      : item.text}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-3">
                    <Link
                      to="/retrieval"
                      state={{
                        query: caseResult.question,
                        topK: config.topK,
                        scoreThreshold: config.scoreThreshold,
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-accent underline-offset-4 hover:underline"
                    >
                      <ScanSearch size={11} aria-hidden="true" />
                      {t("evaluation.openInRetrieval")}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {metrics && (
            <div className="rounded-lg border border-line bg-surface px-4 py-2">
              <p className="border-b border-line pb-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
                {t("evaluation.caseMetrics")}
              </p>
              <Metric
                label={`Hit@${config.topK}`}
                value={metrics.hitAtK ? "✓ 1" : "✕ 0"}
              />
              <Metric
                label={`Recall@${config.topK}`}
                value={metrics.recallAtK.toFixed(2)}
              />
              <Metric
                label={`Precision@${config.topK}`}
                value={metrics.precisionAtK.toFixed(2)}
              />
              <Metric
                label={t("evaluation.rr")}
                value={
                  metrics.reciprocalRank.toFixed(2) +
                  (metrics.firstRelevantRank
                    ? ` · #${metrics.firstRelevantRank}`
                    : "")
                }
              />
            </div>
          )}

          {caseResult.referenceAnswer && (
            <EducationalCallout
              title={t("evaluation.referenceAnswer")}
              body={caseResult.referenceAnswer}
              className="border-line bg-canvas"
            />
          )}
        </>
      )}

      {generation && (
        <div className="rounded-lg border border-line bg-surface px-4 py-3">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            <Quote size={11} aria-hidden="true" />
            {t("evaluation.generatedAnswer")}
          </p>
          {generation.errorCode ? (
            <p className="mt-1.5 text-sm text-danger">
              {generation.errorCode}
            </p>
          ) : (
            <>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {generation.answer.length > 320
                  ? `${generation.answer.slice(0, 320)}…`
                  : generation.answer}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {generation.verifiedCitations.map((citation) => (
                  <StatusBadge
                    key={citation}
                    label={`${citation} · ${t("playground.sources.verified")}`}
                    tone="success"
                  />
                ))}
                {generation.unresolvedCitations.map((number) => (
                  <StatusBadge
                    key={number}
                    label={`[SOURCE_${number}] · ${t("playground.sources.unresolvedTitle")}`}
                    tone="danger"
                  />
                ))}
                {generation.verifiedCitations.length === 0 &&
                  generation.unresolvedCitations.length === 0 && (
                    <StatusBadge
                      label={t("evaluation.noCitations")}
                      tone="warning"
                    />
                  )}
              </div>
              {generation.metrics?.completionTokens !== undefined && (
                <p className="mt-2 font-mono text-[11px] text-faint">
                  {t("evaluation.tokensAndTime")}:{" "}
                  {generation.metrics.completionTokens} ·{" "}
                  {Math.round(
                    (generation.metrics.elapsedMs ?? 0) / 1000
                  )}{" "}
                  s
                </p>
              )}
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-line pt-3">
        <Link
          to="/playground"
          state={{
            query: caseResult.question,
            topK: config.topK,
            scoreThreshold: config.scoreThreshold,
          }}
          className={buttonStyles("secondary", "h-8 px-3 text-xs")}
        >
          <Layers size={12} aria-hidden="true" />
          {t("evaluation.openInPlayground")}
        </Link>
        {caseResult.skipped && (
          <span className="flex items-center gap-1.5 text-xs text-warning">
            <CircleAlert size={12} aria-hidden="true" />
            {t("evaluation.skippedCase")}
          </span>
        )}
      </div>
    </div>
  );
}
