import { useMemo } from "react";
import type { PipelineStage } from "../types/domain";
import type { StageMeta } from "../data/mockPipeline";
import { useI18n } from "../hooks/useI18n";
import type { TranslationKey } from "../i18n";

export function usePipelineStages(meta: StageMeta[]): PipelineStage[] {
  const { t } = useI18n();
  return useMemo(
    () =>
      meta.map((stage) => ({
        id: stage.id,
        icon: stage.icon,
        status: stage.status,
        detail: stage.detail,
        label: t(`pipeline.stages.${stage.id}.label` as TranslationKey),
        description: t(
          `pipeline.stages.${stage.id}.description` as TranslationKey
        ),
      })),
    [t, meta]
  );
}
