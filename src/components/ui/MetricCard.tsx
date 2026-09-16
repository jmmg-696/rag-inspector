import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm transition-colors hover:border-line-strong">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-widest text-faint">
          {label}
        </p>
        <span className="text-faint" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
