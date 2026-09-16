import { useI18n } from "../../hooks/useI18n";
import type { ChunkRecord } from "../../types/domain";
import { cn } from "../../lib/cn";

const MAX_ROWS = 14;

/**
 * Staircase visualization of a document being cut into chunks.
 * Each row is one chunk; the translucent tail is the text repeated
 * by the overlap. Positions are derived from cumulative character
 * offsets (window minus overlap), matching the backend step exactly.
 */
export function ChunkStrip({
  chunks,
  totalCharacters,
  chunkOverlap,
  charactersPerToken,
  selectedIndex,
  onSelect,
}: {
  chunks: ChunkRecord[];
  totalCharacters: number;
  chunkOverlap: number;
  charactersPerToken: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const { t } = useI18n();
  if (chunks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-faint">
        {t("detail.chunks.none")}
      </p>
    );
  }

  const overlapChars = chunkOverlap * charactersPerToken;
  const visible = chunks.slice(0, MAX_ROWS);
  const stepFor = (chunk: ChunkRecord) =>
    Math.max(chunk.characterCount - overlapChars, 1);

  const positioned = visible.map((chunk) => {
    const preceding = chunks.slice(0, chunk.index);
    const start = preceding.reduce(
      (sum, previous) => sum + stepFor(previous),
      0
    );
    return { chunk, start };
  });

  const pct = (value: number) =>
    `${Math.min(Math.max((value / Math.max(totalCharacters, 1)) * 100, 0), 100)}%`;

  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-faint">
        <span>{t("common.table.document")}</span>
        <span>
          {chunks.length} {t("detail.chunk.plural")}
        </span>
      </div>
      <div
        className="mt-1.5 h-3 rounded-sm bg-elevated"
        aria-hidden="true"
        title={t("detail.chunking.visualHint")}
      />
      <ol
        className="relative mt-2"
        style={{ height: visible.length * 20 }}
        aria-label={t("detail.chunking.visualTitle")}
      >
        {positioned.map(({ chunk, start }) => {
          const left = (start / Math.max(totalCharacters, 1)) * 100;
          const rawWidth = (chunk.characterCount / Math.max(totalCharacters, 1)) * 100;
          const width = Math.min(rawWidth, 100 - left);
          const tail =
            overlapChars > 0 && chunk.characterCount > 0
              ? Math.max(
                  ((chunk.characterCount - overlapChars) /
                    chunk.characterCount) *
                    100,
                  8
                )
              : 100;
          const selected = chunk.index === selectedIndex;
          return (
            <li
              key={chunk.id}
              className="absolute left-0 right-0"
              style={{ top: (chunk.index % MAX_ROWS) * 20 }}
            >
              <button
                type="button"
                onClick={() => onSelect(chunk.index)}
                aria-label={t("detail.chunk.badge", { index: chunk.index })}
                aria-pressed={selected}
                className={cn(
                  "group absolute h-3.5 rounded-sm transition-[left,width] duration-500",
                  selected
                    ? "ring-2 ring-accent ring-offset-1 ring-offset-canvas"
                    : "hover:ring-1 hover:ring-accent/50"
                )}
                style={{
                  left: `min(${pct(start)}, calc(100% - 8px))`,
                  width: `${width}%`,
                  maxWidth: `calc(100% - ${Math.min(left, 100)}%)`,
                }}
              >
                <span
                  className="absolute inset-0 rounded-sm bg-accent/25"
                  aria-hidden="true"
                />
                <span
                  className="absolute inset-y-0 left-0 rounded-sm bg-accent/85"
                  style={{ width: `${tail}%` }}
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ol>
      {chunks.length > MAX_ROWS && (
        <p className="mt-1.5 font-mono text-[11px] text-faint">
          {t("detail.chunk.of", { current: MAX_ROWS, total: chunks.length })}
        </p>
      )}
    </div>
  );
}
