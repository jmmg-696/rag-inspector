import {
  Binary,
  CircleCheck,
  Database,
  LoaderCircle,
  ScanText,
  Scissors,
  Sparkles,
  Upload,
  CircleAlert,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { TranslationKey } from "../../i18n";
import type { PipelineStatus } from "../../types/domain";
import { cn } from "../../lib/cn";

const stages: { key: string; icon: LucideIcon }[] = [
  { key: "upload", icon: Upload },
  { key: "extract", icon: ScanText },
  { key: "clean", icon: Sparkles },
  { key: "chunk", icon: Scissors },
  { key: "embed", icon: Binary },
  { key: "index", icon: Database },
  { key: "ready", icon: CircleCheck },
];

// Which stage index is "in flight" for each document status.
const currentStage: Record<PipelineStatus, number> = {
  uploaded: 0,
  extracting: 1,
  cleaning: 2,
  chunking: 3,
  embedding: 4,
  indexing: 5,
  ready: stages.length,
  error: 4,
};

export function IngestionPipeline({
  status,
  errorCode,
}: {
  status: PipelineStatus;
  errorCode?: string;
}) {
  const { t } = useI18n();
  const isFailure = status === "error";
  const failedStage = errorCode === "vector_store_unavailable" ? 5 : 4;
  const current = isFailure ? failedStage : currentStage[status] ?? 0;

  return (
    <ol className="space-y-2" aria-label={t("detail.ingest.title")}>
      {stages.map(({ key, icon: Icon }, index) => {
        const done = !isFailure && index < current;
        const running = status !== "ready" && !isFailure && index === current;
        const failed = isFailure && index === failedStage;
        const pending = index > current || (isFailure && index !== failedStage);
        return (
          <li
            key={key}
            className={cn(
              "flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
              done && "border-line bg-canvas",
              running && "border-accent/40 bg-accent-soft/40",
              failed && "border-danger/40 bg-danger-soft",
              pending && !failed && "border-line bg-canvas opacity-55"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                done && "border-success/30 bg-success-soft text-success",
                running && "border-accent/40 bg-surface text-accent",
                failed && "border-danger/40 bg-surface text-danger",
                pending && !failed && "border-line bg-surface text-faint"
              )}
            >
              {failed ? (
                <CircleAlert size={16} aria-hidden="true" />
              ) : (
                <Icon size={16} aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">
                  {t(`detail.ingest.${key}.label` as TranslationKey)}
                </span>
                {done && (
                  <CircleCheck
                    size={15}
                    aria-label={t("common.indexed")}
                    className="shrink-0 text-success"
                  />
                )}
                {running && (
                  <LoaderCircle
                    size={15}
                    aria-label={t("common.running")}
                    className="shrink-0 animate-spin text-accent"
                  />
                )}
                {failed && (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-danger">
                    {t("common.status.error")}
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                {failed && errorCode
                  ? t(errorKeysForText(errorCode))
                  : t(`detail.ingest.${key}.why` as TranslationKey)}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function errorKeysForText(code: string): TranslationKey {
  const known: TranslationKey[] = [
    "error.vector_store_unavailable.body",
    "error.embedding_model_unavailable.body",
    "error.embedding_failed.body",
  ];
  const key = `error.${code}.body` as TranslationKey;
  return known.includes(key) ? key : "error.embedding_failed.body";
}
