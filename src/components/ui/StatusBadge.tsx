import { cn } from "../../lib/cn";

export type StatusBadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export function StatusBadge({
  label,
  tone = "neutral",
  pulse = false,
}: {
  label: string;
  tone?: StatusBadgeTone;
  pulse?: boolean;
}) {
  const dot: Record<StatusBadgeTone, string> = {
    neutral: "bg-faint",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1",
        "font-mono text-[11px] uppercase tracking-wide text-muted"
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
              dot[tone]
            )}
          />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dot[tone])} />
      </span>
      {label}
    </span>
  );
}
