import { Info } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/cn";

export function InfoTooltip({ body }: { body: string }) {
  const [pinned, setPinned] = useState(false);
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={body}
        onClick={() => setPinned((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setPinned(false);
        }}
        onBlur={() => setPinned(false)}
        className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full text-faint transition-colors hover:text-accent"
      >
        <Info size={13} aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        className={cn(
          "invisible absolute bottom-full left-1/2 z-40 mb-2 w-64 -translate-x-1/2",
          "rounded-lg border border-line bg-surface p-3 text-left font-sans text-xs",
          "leading-relaxed text-muted shadow-lg group-hover:visible group-focus-within:visible",
          pinned && "visible"
        )}
      >
        {body}
      </span>
    </span>
  );
}
