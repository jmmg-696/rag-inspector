import type { EvalMetric } from "../../types/domain";
import { SimilarityBar } from "../ui/SimilarityBar";

export function EvalMetricCard({ metric }: { metric: EvalMetric }) {
  const pct = Math.round(metric.value * 100);
  const tone =
    metric.value >= 0.9 ? "success" : metric.value >= 0.75 ? "accent" : "warning";
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <p className="font-mono text-[11px] uppercase tracking-widest text-faint">
        {metric.label}
      </p>
      <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-ink">
        {pct}
        <span className="text-lg text-faint">%</span>
      </p>
      <SimilarityBar value={metric.value} tone={tone} className="mt-3" />
      <p className="mt-3 text-xs leading-relaxed text-muted">
        {metric.description}
      </p>
    </div>
  );
}
