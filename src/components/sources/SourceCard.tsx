import { ArrowUpRight, FileText } from "lucide-react";
import type { SourceReference } from "../../types/domain";
import { SimilarityBar } from "../ui/SimilarityBar";
import { cn } from "../../lib/cn";

export function SourceCard({
  source,
  index,
  onOpen,
}: {
  source: SourceReference;
  index: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ animationDelay: `${index * 90}ms` }}
      className={cn(
        "group flex h-full animate-fade-up flex-col rounded-xl border border-line bg-surface p-4 text-left shadow-sm",
        "transition-colors hover:border-accent/40 hover:bg-elevated/40"
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
            <FileText size={15} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink">
              {source.document}
            </span>
            <span className="block font-mono text-[11px] text-faint">
              Page {source.page}
            </span>
          </span>
        </span>
        <ArrowUpRight
          size={14}
          aria-hidden="true"
          className="shrink-0 text-faint transition-colors group-hover:text-accent"
        />
      </span>

      <span className="mt-4 flex items-center justify-between font-mono text-[11px] text-muted">
        <span>Similarity</span>
        <span className="font-medium text-ink">
          {Math.round(source.similarity * 100)}%
        </span>
      </span>
      <SimilarityBar value={source.similarity} tone="success" className="mt-1.5" />

      <span className="mt-4 border-t border-line pt-3 text-sm italic leading-relaxed text-muted">
        “{source.snippet}”
      </span>
    </button>
  );
}
