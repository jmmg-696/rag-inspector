import type { StatusBadgeTone } from "../components/ui/StatusBadge";
import type { EvalStatus } from "../types/domain";

export const evalStatusMeta: Record<
  EvalStatus,
  { label: string; tone: StatusBadgeTone }
> = {
  pass: { label: "Pass", tone: "success" },
  warn: { label: "Review", tone: "warning" },
  fail: { label: "Fail", tone: "danger" },
};
