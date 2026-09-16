import { AlertTriangle, RefreshCw, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { DocumentCard } from "../components/documents/DocumentCard";
import { DocumentDetails } from "../components/documents/DocumentDetails";
import { DocumentTable } from "../components/documents/DocumentTable";
import { EmptyState } from "../components/ui/EmptyState";
import { FileSearch } from "lucide-react";
import { MiniPipeline } from "../components/documents/MiniPipeline";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { RealDocumentTable } from "../components/documents/RealDocumentTable";
import { Search } from "lucide-react";
import { Skeleton } from "../components/ui/Skeleton";
import { UploadModal } from "../components/documents/UploadModal";
import { useI18n } from "../hooks/useI18n";
import { errorKeysFor } from "../lib/apiError";
import { ApiError, documentService } from "../services/documentService";
import { mockDocuments } from "../data/mockDocuments";
import type { DocumentSummary, KnowledgeDocument } from "../types/domain";

type BackendStatus = "checking" | "online" | "offline";

export default function DocumentsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [status, setStatus] = useState<BackendStatus>("checking");
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loadErrorCode, setLoadErrorCode] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [demoSelected, setDemoSelected] = useState<KnowledgeDocument | null>(
    null
  );
  const [uploadOpen, setUploadOpen] = useState(false);

  const refresh = useCallback(() => {
    documentService.health().then((online) => {
      if (!online) {
        setStatus("offline");
        return;
      }
      setStatus("online");
      documentService
        .list()
        .then(setDocuments)
        .catch((error: unknown) => {
          setLoadErrorCode(
            error instanceof ApiError ? error.code : "unknown"
          );
        });
    });
  }, []);

  const retry = () => {
    setStatus("checking");
    refresh();
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  const term = filter.trim().toLowerCase();
  const realFiltered = useMemo(
    () =>
      term
        ? documents.filter((doc) => doc.name.toLowerCase().includes(term))
        : documents,
    [documents, term]
  );
  const demoFiltered = useMemo(
    () =>
      term
        ? mockDocuments.filter((doc) => doc.name.toLowerCase().includes(term))
        : mockDocuments,
    [term]
  );

  const toolbar = (total: number, shown: number) => (
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative flex-1 basis-64">
        <span className="sr-only">{t("documents.search.label")}</span>
        <Search
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder={t("documents.search.placeholder")}
          className="h-9 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-faint"
        />
      </label>
      <p className="font-mono text-xs text-faint">
        {t("documents.count", { shown, total })}
      </p>
    </div>
  );

  const noResults = (
    <EmptyState
      icon={FileSearch}
      title={t("documents.noResults.title")}
      description={t("documents.noResults.body", { term: filter.trim() })}
      action={
        <Button variant="secondary" onClick={() => setFilter("")}>
          {t("documents.noResults.clear")}
        </Button>
      }
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("documents.title")}
        description={t("documents.description")}
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <Upload size={15} aria-hidden="true" />
            {t("documents.upload")}
          </Button>
        }
      />

      {status === "checking" && (
        <div className="space-y-3">
          {toolbar(0, 0)}
          <div className="space-y-3 rounded-xl border border-line bg-surface p-5 shadow-sm">
            <p className="font-mono text-[11px] text-faint">
              {t("backend.checking")}
            </p>
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </div>
      )}

      {status === "online" && loadErrorCode && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-danger/40 bg-danger-soft px-4 py-3"
        >
          <AlertTriangle size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
          <div className="flex-1">
            <p className="text-sm font-medium text-ink">
              {t(errorKeysFor(loadErrorCode).titleKey)}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {t(errorKeysFor(loadErrorCode).bodyKey)}
            </p>
          </div>
          <Button variant="secondary" onClick={retry}>
            <RefreshCw size={14} aria-hidden="true" />
            {t("common.retry")}
          </Button>
        </div>
      )}

      {status === "online" && !loadErrorCode && (
        <>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-line bg-surface px-6 py-12 text-center shadow-sm">
              <h2 className="text-base font-semibold text-ink">
                {t("emptyPipeline.title")}
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted">
                {t("emptyPipeline.body")}
              </p>
              <div className="mt-8 w-full max-w-2xl">
                <MiniPipeline />
              </div>
              <div className="mt-8">
                <Button onClick={() => setUploadOpen(true)}>
                  <Upload size={15} aria-hidden="true" />
                  {t("emptyPipeline.upload")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {toolbar(documents.length, realFiltered.length)}
              {realFiltered.length === 0 ? (
                noResults
              ) : (
                <div className="rounded-xl border border-line bg-surface shadow-sm">
                  <RealDocumentTable documents={realFiltered} />
                </div>
              )}
            </>
          )}
        </>
      )}

      {status === "offline" && (
        <>
          <div
            role="alert"
            className="flex flex-wrap items-start gap-3 rounded-lg border border-warning/40 bg-warning-soft px-4 py-3"
          >
            <AlertTriangle
              size={15}
              aria-hidden="true"
              className="mt-1 shrink-0 text-warning"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">
                {t("backend.offline.title")}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">
                {t("backend.offline.body")}
              </p>
            </div>
            <Button variant="secondary" onClick={retry}>
              <RefreshCw size={14} aria-hidden="true" />
              {t("common.retry")}
            </Button>
          </div>

          {toolbar(mockDocuments.length, demoFiltered.length)}
          <p className="text-xs text-faint">{t("backend.demoMode")}</p>
          {demoFiltered.length === 0 ? (
            noResults
          ) : (
            <>
              <div className="hidden rounded-xl border border-line bg-surface shadow-sm md:block">
                <DocumentTable
                  documents={demoFiltered}
                  onSelect={setDemoSelected}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:hidden">
                {demoFiltered.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onSelect={setDemoSelected}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <Modal
        open={demoSelected !== null}
        onClose={() => setDemoSelected(null)}
        title={t("documents.details.title")}
      >
        {demoSelected && <DocumentDetails document={demoSelected} />}
      </Modal>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onIngested={(id) => navigate(`/documents/${id}`)}
      />
    </div>
  );
}
