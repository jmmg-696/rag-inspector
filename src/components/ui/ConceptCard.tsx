import { Lightbulb } from "lucide-react";

export function ConceptCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-line bg-canvas px-4 py-3">
      <Lightbulb
        size={15}
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-warning"
      />
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{body}</p>
      </div>
    </div>
  );
}
