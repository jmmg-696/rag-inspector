import { FileText } from "lucide-react";
import type { LearnVisual } from "../../types/domain";
import { SimilarityBar } from "../ui/SimilarityBar";

export function LearnVisualBlock({ visual }: { visual: LearnVisual }) {
  switch (visual.kind) {
    case "documents":
      return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {visual.items.map((name) => (
            <span
              key={name}
              className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-xs text-muted"
            >
              <FileText size={13} aria-hidden="true" className="shrink-0 text-accent" />
              <span className="truncate">{name}</span>
            </span>
          ))}
        </div>
      );

    case "chunks":
      return (
        <div>
          <p className="text-xs leading-relaxed text-muted">
            &ldquo;The responsible area must review each request before it is
            forwarded to the designated approver&hellip;&rdquo;
          </p>
          <div
            className="mt-3 flex h-3 gap-px overflow-hidden rounded-full"
            aria-hidden="true"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={i % 2 === 0 ? "flex-1 bg-accent/70" : "flex-1 bg-accent/30"}
              />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap justify-between gap-x-4 font-mono text-[11px] text-faint">
            <span>{visual.size} tokens / chunk</span>
            <span>{visual.overlap}% overlap</span>
            <span>{visual.total.toLocaleString("en-US")} chunks</span>
          </div>
        </div>
      );

    case "embeddings":
      return (
        <ul className="space-y-3.5">
          {visual.samples.map((sample) => (
            <li key={sample.text} className="space-y-1.5">
              <p className="rounded-md border border-line bg-surface px-3 py-2 font-mono text-[11px] leading-relaxed text-muted">
                &ldquo;{sample.text}&rdquo;
              </p>
              <p className="truncate font-mono text-[11px] text-accent">
                → [{sample.vector.join(", ")}, … ]
              </p>
            </li>
          ))}
        </ul>
      );

    case "vector-search":
      return (
        <div>
          <p className="font-mono text-[11px] text-faint">
            query → &ldquo;{visual.query}&rdquo;
          </p>
          <ul className="mt-3 space-y-2.5">
            {visual.points.map((point) => (
              <li key={point.label} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-xs text-muted sm:w-52">
                  {point.label}
                </span>
                <SimilarityBar
                  value={point.distance}
                  tone={point.distance >= 0.6 ? "accent" : "warning"}
                  className="min-w-0 flex-1"
                />
                <span className="w-10 shrink-0 text-right font-mono text-[11px] text-ink">
                  {point.distance.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "context": {
      const usedTokens = visual.chunks.length * 512;
      const usedPct = Math.round((usedTokens / visual.window) * 100);
      return (
        <div>
          <div
            className="flex h-2.5 overflow-hidden rounded-full bg-elevated"
            aria-hidden="true"
          >
            <div className="bg-accent" style={{ width: `${usedPct}%` }} />
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-faint">
            {usedTokens.toLocaleString("en-US")} /{" "}
            {visual.window.toLocaleString("en-US")} tokens of the context
            window
          </p>
          <ul className="mt-3 space-y-1.5">
            {visual.chunks.map((chunk, i) => (
              <li
                key={chunk}
                className="rounded-md border border-line bg-surface px-3 py-2 font-mono text-[11px] text-muted"
              >
                <span className="text-accent">[{i + 1}]</span> {chunk}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case "generation":
      return (
        <div className="space-y-2.5">
          <p className="rounded-md border border-line bg-surface px-3 py-2.5 font-mono text-[11px] text-faint">
            {visual.prompt}
          </p>
          <p className="rounded-md border border-accent/40 bg-accent-soft px-3 py-2.5 text-sm leading-relaxed text-ink">
            {visual.answer}
          </p>
        </div>
      );
  }
}
