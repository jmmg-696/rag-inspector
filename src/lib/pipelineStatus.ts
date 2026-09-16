import type { StatusBadgeTone } from "../components/ui/StatusBadge";
import type { TranslationKey } from "../i18n";
import type { PipelineStatus } from "../types/domain";
import { ACTIVE_PIPELINE_STATUSES } from "../types/domain";

export const pipelineStatusMeta: Record<
  PipelineStatus,
  { labelKey: TranslationKey; tone: StatusBadgeTone; pulse: boolean }
> = {
  uploaded: { labelKey: "common.status.uploaded", tone: "warning", pulse: true },
  extracting: {
    labelKey: "common.status.extracting",
    tone: "warning",
    pulse: true,
  },
  cleaning: { labelKey: "common.status.cleaning", tone: "warning", pulse: true },
  chunking: { labelKey: "common.status.chunking", tone: "warning", pulse: true },
  embedding: {
    labelKey: "common.status.embedding",
    tone: "warning",
    pulse: true,
  },
  indexing: { labelKey: "common.status.indexing", tone: "warning", pulse: true },
  ready: { labelKey: "common.status.ready", tone: "success", pulse: false },
  error: { labelKey: "common.status.error", tone: "danger", pulse: false },
};

export function isProcessingStatus(status: PipelineStatus): boolean {
  return ACTIVE_PIPELINE_STATUSES.includes(status);
}
