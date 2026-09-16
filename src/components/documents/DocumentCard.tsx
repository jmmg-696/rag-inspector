import { FileText } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { KnowledgeDocument } from "../../types/domain";
import { documentStatusMeta } from "../../lib/documentStatus";
import { formatChunkCount } from "../../lib/format";
import { StatusBadge } from "../ui/StatusBadge";

export function DocumentCard({
  document,
  onSelect,
}: {
  document: KnowledgeDocument;
  onSelect: (document: KnowledgeDocument) => void;
}) {
  const { t } = useI18n();
  const status = documentStatusMeta[document.status];
  return (
    <button
      type="button"
      onClick={() => onSelect(document)}
      className="w-full rounded-xl border border-line bg-surface p-4 text-left shadow-sm transition-colors hover:border-line-strong"
    >
      <span className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-elevated text-muted">
          <FileText size={16} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">
            {document.name}
          </span>
          <span className="mt-0.5 block font-mono text-[11px] text-faint">
            {document.type} · {document.pages} {t("detail.page.plural")} ·{" "}
            {document.chunks > 0 ? formatChunkCount(document.chunks) : "0"}{" "}
            {t("detail.chunk.plural")}
          </span>
        </span>
        <StatusBadge
          label={t(status.labelKey)}
          tone={status.tone}
          pulse={status.pulse}
        />
      </span>
      <span className="mt-3 block border-t border-line pt-2.5 font-mono text-[11px] text-faint">
        {t("common.table.added")} {document.addedAgo}
      </span>
    </button>
  );
}
