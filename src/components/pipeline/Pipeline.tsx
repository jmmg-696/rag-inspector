import { ArrowRight } from "lucide-react";
import { useState } from "react";
import type { PipelineStage } from "../../types/domain";
import { PipelineStep } from "./PipelineStep";

export function Pipeline({ stages }: { stages: PipelineStage[] }) {
  const [selectedId, setSelectedId] = useState("retrieval");
  const selected =
    stages.find((stage) => stage.id === selectedId) ?? stages[0];

  return (
    <div>
      <ol
        aria-label="RAG pipeline stages"
        className="flex items-center overflow-x-auto pb-1"
      >
        {stages.map((stage, i) => (
          <li key={stage.id} className="flex items-center">
            <PipelineStep
              stage={stage}
              state={stage.id === selectedId ? "selected" : "idle"}
              onSelect={() => setSelectedId(stage.id)}
              onHover={() => setSelectedId(stage.id)}
            />
            {i < stages.length - 1 && (
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="mx-0.5 shrink-0 text-faint"
              />
            )}
          </li>
        ))}
      </ol>
      {selected && (
        <div
          aria-live="polite"
          className="mt-4 rounded-lg border border-line bg-elevated/60 p-4"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            Pipeline stage
          </p>
          <p className="mt-1.5 text-sm font-semibold text-ink">
            {selected.label}
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            {selected.description}
          </p>
        </div>
      )}
    </div>
  );
}
