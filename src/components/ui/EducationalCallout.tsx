import { cn } from "../../lib/cn";

export function EducationalCallout({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-accent/30 bg-accent-soft/40 px-4 py-3",
        className
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
        {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
