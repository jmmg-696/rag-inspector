import { Fragment } from "react";
import { useI18n } from "../../hooks/useI18n";
import type { GenerationSourcePayload } from "../../types/domain";
import { cn } from "../../lib/cn";

const CITATION_TOKEN = /\[SOURCE_(\d{1,3})\]/g;

/**
 * Renders the LLM answer with its [SOURCE_n] citations as chips.
 * Valid identifiers become clickable buttons; unknown ones are shown
 * as unresolved — never promoted to real sources.
 */
export function CitationText({
  text,
  sources,
  onSourceClick,
}: {
  text: string;
  sources: GenerationSourcePayload[];
  onSourceClick: (source: GenerationSourcePayload) => void;
}) {
  const { t } = useI18n();
  const byId = new Map(sources.map((source) => [source.sourceId, source]));
  const parts = text.split(CITATION_TOKEN);

  return (
    <p className="text-base leading-relaxed text-ink">
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          return <Fragment key={index}>{part}</Fragment>;
        }
        const sourceId = `SOURCE_${part}`;
        const source = byId.get(sourceId);
        return (
          <button
            key={index}
            type="button"
            onClick={
              source
                ? () => onSourceClick(source)
                : undefined
            }
            title={
              source
                ? `${source.documentName} · ${t("embeddings.chunkLabel", { index: source.chunkIndex })}`
                : t("playground.sources.unresolvedTitle")
            }
            className={cn(
              "mx-0.5 inline-flex items-center rounded border px-1.5 py-0.5 align-baseline font-mono text-[11px] transition-colors",
              source
                ? "border-accent/50 bg-accent-soft text-accent hover:border-accent"
                : "cursor-default border-danger/40 bg-danger-soft text-danger"
            )}
          >
            {sourceId}
          </button>
        );
      })}
    </p>
  );
}
