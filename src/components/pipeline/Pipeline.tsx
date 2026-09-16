import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useI18n } from "../../hooks/useI18n";
import type { TranslationKey } from "../../i18n";
import type { PipelineStage, StageStatus } from "../../types/domain";
import { PipelineStep } from "./PipelineStep";

const legendTone: Record<StageStatus, string> = {
  done: "bg-success",
  current: "bg-accent",
  upcoming: "bg-faint",
};

const legendKey: Record<StageStatus, "done" | "current" | "upcoming"> = {
  done: "done",
  current: "current",
  upcoming: "upcoming",
};

export function Pipeline({ stages }: { stages: PipelineStage[] }) {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState("retrieval");
  const selected = stages.find((stage) => stage.id === selectedId) ?? stages[0];

  return (
    <div>
      <ol
        aria-label={t("overview.pipeline.title")}
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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              {t("overview.pipeline.stageLabel")}
            </p>
            {selected.status && (
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${legendTone[selected.status]}`}
                  aria-hidden="true"
                />
                {t(
                  `overview.pipeline.legend.${legendKey[selected.status]}` as TranslationKey
                )}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm font-semibold text-ink">
            {selected.label}
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            {selected.description}
          </p>
        </div>
      )}

      <ul
        aria-label={t("overview.pipeline.title")}
        className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5"
      >
        {(["done", "current", "upcoming"] as const).map((status) => (
          <li
            key={status}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${legendTone[status]}`}
              aria-hidden="true"
            />
            {t(`overview.pipeline.legend.${status}` as TranslationKey)}
          </li>
        ))}
      </ul>
    </div>
  );
}
