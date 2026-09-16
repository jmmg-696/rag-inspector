import { Check, LoaderCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import type { PipelineStage } from "../../types/domain";
import { stageIcons } from "./stageIcons";

export type StepState = "idle" | "selected" | "running" | "done";

interface PipelineStepProps {
  stage: PipelineStage;
  state?: StepState;
  orientation?: "horizontal" | "vertical";
  index?: number;
  total?: number;
  onSelect?: () => void;
  onHover?: () => void;
}

function IconBox({
  stage,
  state,
}: {
  stage: PipelineStage;
  state: StepState;
}) {
  const Icon = stageIcons[stage.icon];
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-surface transition-colors",
        state === "selected" && "border-accent/50 bg-accent-soft text-accent",
        state === "running" && "border-accent/50 bg-accent-soft text-accent",
        state === "done" && "border-success/40 bg-success-soft text-success",
        state === "idle" && "border-line text-muted"
      )}
    >
      <Icon size={18} aria-hidden="true" />
    </span>
  );
}

export function PipelineStep({
  stage,
  state = "idle",
  orientation = "horizontal",
  index,
  total,
  onSelect,
  onHover,
}: PipelineStepProps) {
  if (orientation === "vertical") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
          state === "running" && "border-accent/40 bg-accent-soft/40",
          state === "done" && "border-line bg-surface",
          state === "idle" && "border-line bg-surface opacity-55"
        )}
      >
        <IconBox stage={stage} state={state} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{stage.label}</p>
          <p className="truncate font-mono text-[11px] text-faint">
            {state === "idle" && index !== undefined && total !== undefined
              ? `step ${index + 1} of ${total}`
              : stage.detail}
          </p>
        </div>
        {state === "running" && (
          <LoaderCircle
            size={16}
            className="animate-spin text-accent"
            aria-label="Running"
          />
        )}
        {state === "done" && <Check size={16} className="text-success" aria-hidden="true" />}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      onFocus={onSelect}
      aria-pressed={state === "selected"}
      className={cn(
        "group flex w-[104px] shrink-0 flex-col items-center gap-2 rounded-lg border px-1.5 py-3 transition-colors",
        state === "selected"
          ? "border-accent/40 bg-accent-soft"
          : "border-transparent hover:border-line hover:bg-elevated"
      )}
    >
      <IconBox stage={stage} state={state} />
      <span
        className={cn(
          "text-center text-[11px] leading-tight",
          state === "selected" ? "font-medium text-accent" : "text-muted group-hover:text-ink"
        )}
      >
        {stage.label}
      </span>
    </button>
  );
}
