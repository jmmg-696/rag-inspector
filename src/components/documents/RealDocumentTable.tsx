import { Link } from "react-router-dom";
import { FileText, RefreshCw } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { DocumentSummary } from "../../types/domain";
import { pipelineStatusMeta } from "../../lib/pipelineStatus";
import { formatChunkCount, relativeTime } from "../../lib/format";
import { StatusBadge } from "../ui/StatusBadge";

const th =
  "px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-faint first:pl-5";
const td = "px-4 py-3 text-sm text-muted first:pl-5";

export function RealDocumentTable({
  documents,
  busyId,
  onRetry,
}: {
  documents: DocumentSummary[];
  busyId: string | null;
  onRetry: (documentId: string) => void;
}) {
  const { t, language } = useI18n();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse">
        <caption className="sr-only">{t("documents.caption")}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className={th}>
              {t("common.table.document")}
            </th>
            <th scope="col" className={`${th} w-20`}>
              {t("common.table.type")}
            </th>
            <th scope="col" className={`${th} w-16`}>
              {t("common.table.pages")}
            </th>
            <th scope="col" className={`${th} w-20`}>
              {t("common.words")}
            </th>
            <th scope="col" className={`${th} w-20`}>
              {t("common.chunks")}
            </th>
            <th scope="col" className={`${th} w-24`}>
              {t("common.embeddings")}
            </th>
            <th scope="col" className={`${th} w-40`}>
              {t("common.table.status")}
            </th>
            <th scope="col" className={`${th} w-32`}>
              {t("common.table.added")}
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => {
            const status = pipelineStatusMeta[document.status];
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
                      <span className="block truncate text-sm font-medium text-ink underline-offset-4 group-hover:underline">
                        {document.name}
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
                <td className={`${td} font-mono`}>
                  {formatChunkCount(document.embeddingCount)}
                </td>
                <td className={td}>
                  <span className="flex items-center gap-2">
                    <StatusBadge
                      label={t(status.labelKey)}
                      tone={status.tone}
                      pulse={status.pulse}
                    />
                    {document.status === "error" && (
                      <button
                        type="button"
                        onClick={() => onRetry(document.id)}
                        disabled={busyId === document.id}
                        title={t("documents.retryEmbed")}
                        aria-label={`${t("documents.retryEmbed")}: ${document.name}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted transition-colors hover:bg-elevated hover:text-ink disabled:opacity-50"
                      >
                        <RefreshCw
                          size={12}
                          aria-hidden="true"
                          className={busyId === document.id ? "animate-spin" : undefined}
                        />
                      </button>
                    )}
                  </span>
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
