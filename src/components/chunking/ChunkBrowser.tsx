import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { ChunkRecord } from "../../types/domain";
import { formatChunkCount } from "../../lib/format";
import { EducationalCallout } from "../ui/EducationalCallout";
import { cn } from "../../lib/cn";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-faint">
        {label}
      </dt>
      <dd className="font-mono text-xs text-ink">{value}</dd>
    </div>
  );
}

export function ChunkBrowser({
  chunks,
  documentName,
  chunkOverlap,
  selected,
  onSelect,
}: {
  chunks: ChunkRecord[];
  documentName: string;
  chunkOverlap: number;
  selected: number;
  onSelect: (index: number) => void;
}) {
  const { t } = useI18n();
  if (chunks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-surface px-6 py-10 text-center text-sm text-faint">
        {t("detail.chunks.none")}
      </p>
    );
  }
  const chunk = chunks[Math.min(selected, chunks.length - 1)];
  const pages =
    chunk.pageStart === chunk.pageEnd
      ? t("detail.chunk.page", { page: chunk.pageStart })
      : t("detail.chunk.pagesRange", {
          start: chunk.pageStart,
          end: chunk.pageEnd,
        });

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="animate-fade-up rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
            {t("detail.chunk.badge", { index: chunk.index })}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(Math.max(chunk.index - 1, 0))}
              disabled={chunk.index <= 0}
              aria-label={t("detail.chunk.prev")}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted transition-colors hover:bg-elevated hover:text-ink disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono text-[11px] text-faint">
              {t("detail.chunk.of", {
                current: chunk.index + 1,
                total: chunks.length,
              })}
            </span>
            <button
              type="button"
              onClick={() =>
                onSelect(Math.min(chunk.index + 1, chunks.length - 1))
              }
              disabled={chunk.index >= chunks.length - 1}
              aria-label={t("detail.chunk.next")}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted transition-colors hover:bg-elevated hover:text-ink disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="px-4 py-4 sm:px-5">
          <p className="font-mono text-[11px] text-faint">
            {pages} · {chunk.characterCount.toLocaleString("en-US")}{" "}
            {t("common.characters").toLowerCase()} ·{" "}
            {chunk.estimatedTokens} {t("common.tokens").toLowerCase()}
          </p>
          <p
            key={chunk.id}
            className={cn(
              "mt-3 max-h-[420px] animate-fade-in overflow-y-auto whitespace-pre-wrap",
              "text-sm leading-relaxed text-muted"
            )}
          >
            {chunk.text}
          </p>
          {chunkOverlap > 0 && (
            <p className="mt-4 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-widest text-faint">
              {t("common.overlap")} · {chunkOverlap}{" "}
              {t("common.tokens").toLowerCase()}
            </p>
          )}
        </div>
      </div>

      <aside className="animate-fade-up rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
        <h3 className="text-sm font-semibold tracking-tight text-ink">
          {t("detail.chunk.panelTitle", { index: chunk.index })}
        </h3>
        <dl className="mt-3 divide-y divide-line">
          <Field label={t("detail.chunk.source")} value={documentName} />
          <Field
            label={t("common.pages")}
            value={`${chunk.pageStart} → ${chunk.pageEnd}`}
          />
          <Field
            label={t("common.tokens")}
            value={chunk.estimatedTokens.toLocaleString("en-US")}
          />
          <Field
            label={t("common.characters")}
            value={formatChunkCount(chunk.characterCount)}
          />
          <Field
            label={t("common.overlap")}
            value={`${chunkOverlap} ${t("common.tokens").toLowerCase()}`}
          />
        </dl>
        <EducationalCallout
          className="mt-4"
          title={t("detail.chunk.whyTitle")}
          body={t("detail.chunk.whyBody")}
        />
      </aside>
    </div>
  );
}
