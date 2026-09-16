import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownToLine, ChevronDown } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { RetrievalHit } from "../../types/domain";
import { SimilarityBar } from "../ui/SimilarityBar";
import { cn } from "../../lib/cn";

export function RetrievalResultCard({
  hit,
  active,
  onActivate,
}: {
  hit: RetrievalHit;
  active: boolean;
  onActivate: (pointId: string) => void;
}) {
  const { t } = useI18n();
  const [whyOpen, setWhyOpen] = useState(false);
  const scorePct = Math.min(Math.max(hit.score, 0), 1);

  return (
    <li
      id={`hit-${hit.rank}`}
      className={cn(
        "animate-fade-up rounded-xl border bg-surface shadow-sm transition-colors",
        active ? "border-accent/50 ring-1 ring-accent/30" : "border-line"
      )}
    >
      <div className="flex items-start gap-3.5 p-4 sm:p-5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-elevated font-mono text-xs font-medium text-muted"
          aria-label={t("retrieval.rank", { rank: hit.rank })}
        >
          #{hit.rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-sm font-semibold text-ink">
              {hit.score.toFixed(4)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
              {t("retrieval.cosineSimilarity")}
            </span>
            <SimilarityBar
              value={scorePct}
              tone={scorePct >= 0.8 ? "success" : "accent"}
              className="basis-full sm:basis-56"
            />
          </div>
          <p className="mt-2.5 text-sm font-medium text-ink">
            {hit.documentName}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-faint">
            {t("embeddings.chunkLabel", { index: hit.chunkIndex })} ·{" "}
            {t("detail.chunk.page", { page: hit.pageStart })} ·{" "}
            {t("retrieval.tokens", { count: hit.estimatedTokens })}
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            {hit.text.length > 320
              ? `${hit.text.slice(0, 320)}…`
              : hit.text}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3">
            <button
              type="button"
              onClick={() => {
                setWhyOpen((prev) => !prev);
                onActivate(hit.pointId);
              }}
              aria-expanded={whyOpen}
              className="flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-strong"
            >
              {t("retrieval.whyRetrieved")}
              <ChevronDown
                size={12}
                aria-hidden="true"
                className={cn("transition-transform", whyOpen && "rotate-180")}
              />
            </button>
            <Link
              to={`/documents/${hit.documentId}`}
              state={{ tab: "chunks", chunkIndex: hit.chunkIndex }}
              className="flex items-center gap-1.5 text-xs text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              <ArrowDownToLine size={12} aria-hidden="true" />
              {t("retrieval.viewChunk")}
            </Link>
          </div>
          {whyOpen && (
            <p
              aria-live="polite"
              className="mt-2.5 rounded-lg border border-line bg-canvas px-3.5 py-3 text-xs leading-relaxed text-muted"
            >
              {t("retrieval.whyRetrievedBody", {
                score: hit.score.toFixed(4),
              })}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
