import { useState } from "react";
import { useI18n } from "../../hooks/useI18n";
import { formatChunkCount } from "../../lib/format";
import type { SemanticSpace as SemanticSpaceData } from "../../types/domain";

const PAD = 6;

/**
 * 2D scatter of the PCA projection computed server-side.
 * Coordinates are normalized to [-1, 1]; this SVG maps them into a
 * 100x100 viewBox so it scales with its container.
 */
export function SemanticSpace({
  space,
  totalVectors,
  selectedId,
  onSelect,
}: {
  space: SemanticSpaceData;
  totalVectors: number;
  selectedId: string | null;
  onSelect: (pointId: string | null) => void;
}) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState<number | null>(null);

  const map = (value: number) => PAD + ((value + 1) / 2) * (100 - PAD * 2);
  const point = hovered !== null ? space.points[hovered] : null;

  return (
    <div>
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={t("vectorStore.space.title")}
        preserveAspectRatio="xMidYMid meet"
        onClick={() => onSelect(null)}
        className="h-full w-full min-h-64"
      >
        {/* frame + axes */}
        <rect
          x={PAD}
          y={PAD}
          width={100 - PAD * 2}
          height={100 - PAD * 2}
          className="fill-canvas stroke-line"
          strokeWidth="0.3"
          rx="1.5"
        />
        <line
          x1={50}
          y1={PAD + 2}
          x2={50}
          y2={98 - PAD}
          className="stroke-line"
          strokeWidth="0.2"
          strokeDasharray="1 1.5"
        />
        <line
          x1={PAD + 2}
          y1={50}
          x2={98 - PAD}
          y2={50}
          className="stroke-line"
          strokeWidth="0.2"
          strokeDasharray="1 1.5"
        />
        {space.points.map((entry, index) => {
          const selected = entry.pointId === selectedId;
          return (
            <circle
              key={entry.pointId}
              cx={map(entry.x)}
              cy={map(-entry.y)}
              r={selected ? 2.1 : 1.4}
              className={
                selected
                  ? "fill-accent-strong cursor-pointer"
                  : "fill-accent/80 cursor-pointer hover:fill-accent-strong"
              }
              stroke={selected ? "var(--canvas)" : "none"}
              strokeWidth={selected ? 0.7 : 0}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(entry.pointId);
              }}
            />
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="min-h-4 font-mono text-[11px] text-muted">
          {point
            ? `${t("embeddings.chunkLabel", { index: point.chunkIndex })} · ${point.documentName} · ${t("detail.chunk.page", { page: point.pageStart })}`
            : hovered === null && selectedId === null
              ? t("vectorStore.browserHint")
              : ""}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
          {t("vectorStore.space.method", {
            method: space.method,
            shown: formatChunkCount(space.points.length),
            total: formatChunkCount(totalVectors),
          })}
        </p>
      </div>
    </div>
  );
}
