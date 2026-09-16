import {
  CircleCheck,
  Scissors,
  Sparkles,
  Upload,
  ScanText,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { TranslationKey } from "../../i18n";

const steps: { key: string; icon: LucideIcon }[] = [
  { key: "upload", icon: Upload },
  { key: "extract", icon: ScanText },
  { key: "clean", icon: Sparkles },
  { key: "chunk", icon: Scissors },
  { key: "ready", icon: CircleCheck },
];

export function IngestionPipeline() {
  const { t } = useI18n();
  return (
    <ol className="space-y-2" aria-label={t("detail.ingest.title")}>
      {steps.map(({ key, icon: Icon }) => (
        <li
          key={key}
          className="flex items-start gap-3 rounded-lg border border-line bg-canvas px-4 py-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-success/30 bg-success-soft text-success">
            <Icon size={16} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">
                {t(`detail.ingest.${key}.label` as TranslationKey)}
              </span>
              <CircleCheck size={15} aria-hidden="true" className="shrink-0 text-success" />
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted">
              {t(`detail.ingest.${key}.why` as TranslationKey)}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
