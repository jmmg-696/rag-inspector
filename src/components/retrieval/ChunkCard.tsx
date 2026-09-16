import { FileText } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { RetrievedChunk } from "../../types/domain";
import { SimilarityBar } from "../ui/SimilarityBar";

export function ChunkCard({
  chunk,
  index,
}: {
  chunk: RetrievedChunk;
  index: number;
}) {
  const { t } = useI18n();
  const tone = chunk.similarity >= 0.9 ? "success" : "accent";
  return (
    <li
      style={{ animationDelay: `${index * 70}ms` }}
      className="animate-fade-up rounded-xl border border-line bg-surface p-4 shadow-sm transition-colors hover:border-line-strong sm:p-5"
    >
      <div className="flex items-start gap-3.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-elevated font-mono text-xs font-medium text-muted"
          aria-label={t("retrieval.rank", { rank: chunk.rank })}
        >
          #{chunk.rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <FileText size={13} aria-hidden="true" className="text-faint" />
            <span className="text-sm font-medium text-ink">
              {chunk.document}
            </span>
            <span className="font-mono text-[11px] text-faint">
              · {t("detail.chunk.page", { page: chunk.page })}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <SimilarityBar value={chunk.similarity} tone={tone} className="max-w-52" />
            <span className="shrink-0 font-mono text-[11px] text-muted">
              {t("retrieval.similarity")}{" "}
              <span className="font-medium text-ink">
                {chunk.similarity.toFixed(2)}
              </span>
            </span>
          </div>

          <p className="mt-3.5 border-t border-line pt-3.5 text-sm leading-relaxed text-muted">
            {chunk.text}
          </p>
        </div>
      </div>
    </li>
  );
}
