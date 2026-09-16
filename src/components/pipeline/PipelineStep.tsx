import { Check, LoaderCircle } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
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
  completedBadge = false,
}: {
  stage: PipelineStage;
  state: StepState;
  completedBadge?: boolean;
}) {
  const Icon = stageIcons[stage.icon];
  return (
    <span
      className={cn(
        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-surface transition-colors",
        state === "selected" && "border-accent/50 bg-accent-soft text-accent",
        state === "running" && "border-accent/50 bg-accent-soft text-accent",
        state === "done" && "border-success/40 bg-success-soft text-success",
        state === "idle" &&
          (stage.status === "upcoming"
            ? "border-dashed border-line-strong text-faint"
            : "border-line text-muted")
      )}
    >
      <Icon size={18} aria-hidden="true" />
      {completedBadge && (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-success/40 bg-surface text-success">
          <Check size={9} aria-hidden="true" strokeWidth={3} />
        </span>
      )}
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
  const { t } = useI18n();
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
              ? t("common.step", { index: index + 1, total })
              : stage.detail}
          </p>
        </div>
        {state === "running" && (
          <LoaderCircle
            size={16}
            className="animate-spin text-accent"
            aria-label={t("common.running")}
          />
        )}
        {state === "done" && (
          <Check size={16} className="text-success" aria-hidden="true" />
        )}
      </div>
    );
  }

  const upcoming = stage.status === "upcoming";

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
          : "border-transparent hover:border-line hover:bg-elevated",
        upcoming && state !== "selected" && "opacity-70"
      )}
    >
      <span className={cn(upcoming && "[&_svg]:text-faint")}>
        <IconBox
          stage={stage}
          completedBadge={stage.status === "done"}
          state={
            state === "selected"
              ? "selected"
              : stage.status === "done"
                ? "done"
                : stage.status === "current"
                  ? "running"
                  : "idle"
          }
        />
      </span>
      <span
        className={cn(
          "text-center text-[11px] leading-tight",
          state === "selected"
            ? "font-medium text-accent"
            : upcoming
              ? "text-faint"
              : "text-muted group-hover:text-ink"
        )}
      >
        {stage.label}
      </span>
    </button>
  );
}
