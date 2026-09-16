import type { StatusBadgeTone } from "../components/ui/StatusBadge";
import type { TranslationKey } from "../i18n";
import type { DocumentStatus } from "../types/domain";

export const documentStatusMeta: Record<
  DocumentStatus,
  { labelKey: TranslationKey; tone: StatusBadgeTone; pulse: boolean }
> = {
  ready: { labelKey: "common.status.ready", tone: "success", pulse: false },
  processing: {
    labelKey: "common.status.processing",
    tone: "warning",
    pulse: true,
  },
  failed: { labelKey: "common.status.failed", tone: "danger", pulse: false },
};
