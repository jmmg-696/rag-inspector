import { useI18n } from "../../hooks/useI18n";
import { CHUNK_OVERLAPS, CHUNK_SIZES } from "../../types/domain";
import { InfoTooltip } from "../ui/InfoTooltip";
import { cn } from "../../lib/cn";

function OptionRow({
  name,
  legend,
  options,
  value,
  onChange,
  tooltip,
}: {
  name: string;
  legend: string;
  options: number[];
  value: number;
  onChange: (value: number) => void;
  tooltip: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
        {legend}
        <InfoTooltip body={tooltip} />
      </legend>
      <div
        className="flex flex-wrap gap-1.5"
        role="radiogroup"
        aria-label={legend}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={option === value}
            name={name}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-md border px-3 py-1.5 font-mono text-xs transition-colors",
              option === value
                ? "border-accent/50 bg-accent-soft font-medium text-accent"
                : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function ChunkSettingsPanel({
  chunkSize,
  chunkOverlap,
  onChangeSize,
  onChangeOverlap,
}: {
  chunkSize: number;
  chunkOverlap: number;
  onChangeSize: (size: number) => void;
  onChangeOverlap: (overlap: number) => void;
}) {
  const { t } = useI18n();

  const overlapOptions: number[] = (() => {
    const valid = CHUNK_OVERLAPS.filter(
      (option) => option < chunkSize
    ) as number[];
    if (valid.includes(chunkOverlap) || valid.length === 0) return valid;
    return [...valid, chunkOverlap].sort((a, b) => a - b);
  })();

  return (
    <div className="space-y-5">
      <OptionRow
        name="chunk-size"
        legend={t("common.chunkSize")}
        options={[...CHUNK_SIZES]}
        value={chunkSize}
        onChange={onChangeSize}
        tooltip={t("detail.chunking.sizeTip")}
      />
      <OptionRow
        name="chunk-overlap"
        legend={t("common.overlap")}
        options={overlapOptions}
        value={chunkOverlap}
        onChange={onChangeOverlap}
        tooltip={t("detail.chunking.overlapTip")}
      />
    </div>
  );
}
