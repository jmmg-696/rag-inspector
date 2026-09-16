import { SimilarityBar } from "../ui/SimilarityBar";

export function EvalMetricCard({
  label,
  description,
  value,
}: {
  label: string;
  description: string;
  value: number;
}) {
  const pct = Math.round(value * 100);
  const tone = value >= 0.9 ? "success" : value >= 0.75 ? "accent" : "warning";
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <p className="font-mono text-[11px] uppercase tracking-widest text-faint">
        {label}
      </p>
      <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-ink">
        {pct}
        <span className="text-lg text-faint">%</span>
      </p>
      <SimilarityBar value={value} tone={tone} className="mt-3" />
      <p className="mt-3 text-xs leading-relaxed text-muted">{description}</p>
    </div>
  );
}
