import { Link } from "react-router-dom";
import { ArrowUpRight, FileText } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { GenerationSourcePayload } from "../../types/domain";
import { SimilarityBar } from "../ui/SimilarityBar";
import { StatusBadge } from "../ui/StatusBadge";

export function SourceCards({
  sources,
  highlightedSource,
}: {
  sources: GenerationSourcePayload[];
  highlightedSource: string | null;
}) {
  const { t } = useI18n();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {sources.map((source, index) => (
        <article
          id={`source-${source.sourceId}`}
          key={source.sourceId}
          style={{ animationDelay: `${index * 70}ms` }}
          className={
            highlightedSource === source.sourceId
              ? "animate-fade-up scroll-mt-24 rounded-xl border border-accent/60 bg-accent-soft/40 p-4 shadow-sm ring-1 ring-accent/30"
              : "animate-fade-up scroll-mt-24 rounded-xl border border-line bg-surface p-4 shadow-sm"
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                <FileText size={15} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-accent">
                  {source.sourceId}
                </p>
                <p className="truncate text-sm font-medium text-ink">
                  {source.documentName}
                </p>
              </div>
            </div>
            <StatusBadge
              label={t("playground.sources.verified")}
              tone="success"
            />
          </div>
          <p className="mt-2 font-mono text-[11px] text-faint">
            {t("embeddings.chunkLabel", { index: source.chunkIndex })} ·{" "}
            {t("retrieval.similarity")}{" "}
            <span className="text-ink">{source.score.toFixed(4)}</span>
          </p>
          <SimilarityBar
            value={Math.min(Math.max(source.score, 0), 1)}
            tone={source.score >= 0.8 ? "success" : "accent"}
            className="mt-2"
          />
          <p className="mt-3 border-t border-line pt-3 text-sm italic leading-relaxed text-muted">
            “{source.text.slice(0, 180)}
            {source.text.length > 180 ? "…" : ""}”
          </p>
          <Link
            to={`/documents/${source.documentId}`}
            state={{ tab: "chunks", chunkIndex: source.chunkIndex }}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent underline-offset-4 hover:underline"
          >
            <ArrowUpRight size={12} aria-hidden="true" />
            {t("playground.sources.open")}
          </Link>
        </article>
      ))}
    </div>
  );
}
