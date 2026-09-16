import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  badge,
  actions,
}: {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {(badge || actions) && (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {badge}
          {actions}
        </div>
      )}
    </header>
  );
}
