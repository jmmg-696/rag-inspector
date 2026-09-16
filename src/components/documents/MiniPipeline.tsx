import {
  ArrowRight,
  Binary,
  Boxes,
  FileText,
  Radar,
  ScanText,
} from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { TranslationKey } from "../../i18n";

export function MiniPipeline() {
  const { t } = useI18n();
  const nodes = [
    { label: "PDF", icon: FileText, enabled: true },
    {
      label: t("documents.miniPipeline.text"),
      icon: ScanText,
      enabled: true,
    },
    { label: t("common.chunks"), icon: Boxes, enabled: true },
    {
      label: t("pipeline.stages.embeddings.label" as TranslationKey),
      icon: Binary,
      enabled: false,
    },
    {
      label: t("pipeline.stages.retrieval.label" as TranslationKey),
      icon: Radar,
      enabled: false,
    },
  ];
  return (
    <div>
      <ol className="flex flex-wrap items-center justify-center gap-y-3">
        {nodes.map((node, i) => (
          <li key={node.label} className="flex items-center">
            <span
              className={
                node.enabled
                  ? "flex w-24 flex-col items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-3"
                  : "flex w-24 flex-col items-center gap-1.5 rounded-lg border border-dashed border-line-strong px-2 py-3 opacity-55"
              }
            >
              <node.icon
                size={15}
                aria-hidden="true"
                className={node.enabled ? "text-accent" : "text-faint"}
              />
              <span className="text-center text-[11px] leading-tight text-muted">
                {node.label}
              </span>
            </span>
            {i < nodes.length - 1 && (
              <ArrowRight size={13} aria-hidden="true" className="mx-0.5 text-faint" />
            )}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
        {nodes.filter((node) => !node.enabled).length} ·{" "}
        {t("emptyPipeline.future")}
      </p>
    </div>
  );
}
