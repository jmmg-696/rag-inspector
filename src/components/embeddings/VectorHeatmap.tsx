import { useState } from "react";
import { useI18n } from "../../hooks/useI18n";
import { cn } from "../../lib/cn";

const COLUMNS = 32;

function cellColor(value: number): string {
  const tone = value >= 0 ? "var(--accent)" : "var(--muted)";
  const strength = Math.min(Math.abs(value), 1);
  return `color-mix(in oklab, ${tone} ${Math.round(8 + strength * 82)}%, transparent)`;
}

export function VectorHeatmap({ vector }: { vector: number[] }) {
  const { t } = useI18n();
  const [hover, setHover] = useState<{ index: number; value: number } | null>(
    null
  );

  return (
    <figure>
      <figcaption className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-faint">
        <span>{t("embeddings.heatmapTitle")}</span>
        <span>{t("embeddings.dimensionsValue", { count: vector.length })}</span>
      </figcaption>
      <div
        role="img"
        aria-label={t("embeddings.heatmapHint")}
        onMouseLeave={() => setHover(null)}
        className={cn(
          "mt-2 grid gap-[3px] rounded-md border border-line bg-canvas p-2"
        )}
        style={{
          gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`,
        }}
      >
        {vector.map((value, index) => (
          <span
            key={index}
            title={t("embeddings.dimensionTooltip", {
              index,
              value: value.toFixed(3),
            })}
            onMouseEnter={() => setHover({ index, value })}
            className="aspect-square rounded-[2px] transition-transform duration-100 hover:scale-125"
            style={{ backgroundColor: cellColor(value) }}
          />
        ))}
      </div>
      <p
        className={cn(
          "mt-2 min-h-4 font-mono text-[11px] text-muted",
          !hover && "text-faint"
        )}
      >
        {hover
          ? t("embeddings.dimensionTooltip", {
              index: hover.index,
              value: hover.value.toFixed(3),
            })
          : t("embeddings.heatmapHint")}
      </p>
    </figure>
  );
}
