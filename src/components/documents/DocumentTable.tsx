import { FileText } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { KnowledgeDocument } from "../../types/domain";
import { documentStatusMeta } from "../../lib/documentStatus";
import { formatChunkCount } from "../../lib/format";
import { StatusBadge } from "../ui/StatusBadge";

const th =
  "px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-faint first:pl-5";
const td = "px-4 py-3 text-sm text-muted first:pl-5";

export function DocumentTable({
  documents,
  onSelect,
}: {
  documents: KnowledgeDocument[];
  onSelect: (document: KnowledgeDocument) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <caption className="sr-only">{t("documents.caption")}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className={th}>
              {t("common.table.document")}
            </th>
            <th scope="col" className={`${th} w-24`}>
              {t("common.table.type")}
            </th>
            <th scope="col" className={`${th} w-20`}>
              {t("common.table.pages")}
            </th>
            <th scope="col" className={`${th} w-24`}>
              {t("common.table.chunks")}
            </th>
            <th scope="col" className={`${th} w-32`}>
              {t("evaluation.table.status")}
            </th>
            <th scope="col" className={`${th} w-28`}>
              {t("common.table.added")}
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => {
            const status = documentStatusMeta[document.status];
            return (
              <tr
                key={document.id}
                onClick={() => onSelect(document)}
                className="group cursor-pointer border-b border-line last:border-0 transition-colors hover:bg-elevated/50"
              >
                <td className={td}>
                  <span className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-elevated text-muted transition-colors group-hover:text-accent">
                      <FileText size={15} aria-hidden="true" />
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(document);
                      }}
                      className="truncate text-left text-sm font-medium text-ink underline-offset-4 group-hover:underline"
                    >
                      {document.name}
                    </button>
                  </span>
                </td>
                <td className={`${td} font-mono text-xs`}>{document.type}</td>
                <td className={`${td} font-mono`}>{document.pages}</td>
                <td className={`${td} font-mono`}>
                  {document.chunks > 0
                    ? formatChunkCount(document.chunks)
                    : "—"}
                </td>
                <td className={td}>
                  <StatusBadge
                    label={t(status.labelKey)}
                    tone={status.tone}
                    pulse={status.pulse}
                  />
                </td>
                <td className={td}>{document.addedAgo}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
