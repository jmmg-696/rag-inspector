import { cn } from "../../lib/cn";

export function SimilarityBar({
  value,
  tone = "accent",
  className,
}: {
  value: number;
  tone?: "accent" | "success" | "warning";
  className?: string;
}) {
  const fill = {
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
  }[tone];
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={value}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-elevated",
        className
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700", fill)}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}
