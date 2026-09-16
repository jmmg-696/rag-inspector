import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { DocumentSummary } from "../../types/domain";
import { formatChunkCount, relativeTime } from "../../lib/format";
import { StatusBadge } from "../ui/StatusBadge";
import { documentStatusMeta } from "../../lib/documentStatus";
import type { DocumentStatus } from "../../types/domain";

const th =
  "px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-faint first:pl-5";
const td = "px-4 py-3 text-sm text-muted first:pl-5";

export function RealDocumentTable({
  documents,
}: {
  documents: DocumentSummary[];
}) {
  const { t, language } = useI18n();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <caption className="sr-only">{t("documents.caption")}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className={th}>
              {t("common.table.document")}
            </th>
            <th scope="col" className={`${th} w-20`}>
              {t("common.table.type")}
            </th>
            <th scope="col" className={`${th} w-20`}>
              {t("common.table.pages")}
            </th>
            <th scope="col" className={`${th} w-24`}>
              {t("common.words")}
            </th>
            <th scope="col" className={`${th} w-24`}>
              {t("common.table.chunks")}
            </th>
            <th scope="col" className={`${th} w-28`}>
              {t("evaluation.table.status")}
            </th>
            <th scope="col" className={`${th} w-32`}>
              {t("common.table.added")}
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => {
            const status = documentStatusMeta[
              (document.status === "ready"
                ? "ready"
                : document.status) as DocumentStatus
            ];
            return (
              <tr
                key={document.id}
                className="group border-b border-line last:border-0 transition-colors hover:bg-elevated/50"
              >
                <td className={td}>
                  <Link
                    to={`/documents/${document.id}`}
                    className="flex items-center gap-3 text-left"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                      <FileText size={15} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-ink underline-offset-4 group-hover:underline">
                          {document.name}
                        </span>
                        <StatusBadge
                          label={t("documents.badge.local")}
                          tone="accent"
                        />
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] text-faint">
                        {document.chunkSize}{" "}
                        {t("detail.chunk.singular")} · {document.chunkOverlap}{" "}
                        {t("common.overlap").toLowerCase()}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className={`${td} font-mono text-xs`}>
                  {document.type.toUpperCase()}
                </td>
                <td className={`${td} font-mono`}>{document.pageCount}</td>
                <td className={`${td} font-mono`}>
                  {formatChunkCount(document.words)}
                </td>
                <td className={`${td} font-mono`}>
                  {formatChunkCount(document.chunkCount)}
                </td>
                <td className={td}>
                  <StatusBadge
                    label={t(status.labelKey)}
                    tone={status.tone}
                    pulse={status.pulse}
                  />
                </td>
                <td className={td}>
                  {relativeTime(document.createdAt, language)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
