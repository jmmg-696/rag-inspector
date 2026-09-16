import type { StatusBadgeTone } from "../components/ui/StatusBadge";
import type { TranslationKey } from "../i18n";
import type { EvalStatus } from "../types/domain";

export const evalStatusMeta: Record<
  EvalStatus,
  { labelKey: TranslationKey; tone: StatusBadgeTone }
> = {
  pass: { labelKey: "evaluation.status.pass", tone: "success" },
  warn: { labelKey: "evaluation.status.warn", tone: "warning" },
  fail: { labelKey: "evaluation.status.fail", tone: "danger" },
};
