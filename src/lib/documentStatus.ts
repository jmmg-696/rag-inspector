import type { StatusBadgeTone } from "../components/ui/StatusBadge";
import type { DocumentStatus } from "../types/domain";

export const documentStatusMeta: Record<
  DocumentStatus,
  { label: string; tone: StatusBadgeTone; pulse: boolean }
> = {
  ready: { label: "Ready", tone: "success", pulse: false },
  processing: { label: "Processing", tone: "warning", pulse: true },
  failed: { label: "Failed", tone: "danger", pulse: false },
};
