import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import type { KnowledgeDocument } from "../../types/domain";
import { useI18n } from "../../hooks/useI18n";
import { documentStatusMeta } from "../../lib/documentStatus";
import { formatChunkCount } from "../../lib/format";
import { StatusBadge } from "../ui/StatusBadge";
import { buttonStyles } from "../../lib/buttonStyles";

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-canvas px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

export function DocumentDetails({
  document,
}: {
  document: KnowledgeDocument;
}) {
  const { t } = useI18n();
  const status = documentStatusMeta[document.status];
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-elevated text-accent">
          <FileText size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {document.name}
          </p>
          <p className="font-mono text-[11px] text-faint">
            {t("detail.meta", { type: document.type, count: document.pages })}{" "}
            · {t("common.table.added").toLowerCase()} {document.addedAgo}
          </p>
        </div>
        <StatusBadge
          label={t(status.labelKey)}
          tone={status.tone}
          pulse={status.pulse}
          className="ml-auto"
        />
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <MetaItem
          label={t("common.pages")}
          value={String(document.pages)}
        />
        <MetaItem
          label={t("common.chunks")}
          value={
            document.chunks > 0
              ? formatChunkCount(document.chunks)
              : t("documents.notIndexed")
          }
        />
        <MetaItem label={t("nav.embeddings")} value={document.embedding} />
        <MetaItem
          label={t("common.table.status")}
          value={t(status.labelKey)}
        />
      </dl>

      <p className="text-xs leading-relaxed text-muted">
        {t("documents.ingestionNote", { size: 512, overlap: 100 })}
      </p>

      {document.chunks > 0 && (
        <Link
          to="/retrieval"
          className={buttonStyles("secondary", "w-full sm:w-auto")}
        >
          {t("documents.inspectChunks")}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
