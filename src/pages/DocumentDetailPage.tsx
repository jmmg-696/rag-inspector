import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ChunkBrowser } from "../components/chunking/ChunkBrowser";
import { ChunkSettingsPanel } from "../components/chunking/ChunkSettingsPanel";
import { ChunkStrip } from "../components/chunking/ChunkStrip";
import { OverlapExplainer } from "../components/chunking/OverlapExplainer";
import { ExtractedText } from "../components/documents/ExtractedText";
import { EmbeddingsTab } from "../components/embeddings/EmbeddingsTab";
import { IngestionPipeline } from "../components/documents/IngestionPipeline";
import { Card } from "../components/ui/Card";
import { ConceptCard } from "../components/ui/ConceptCard";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { MetricCard } from "../components/ui/MetricCard";
import { Skeleton } from "../components/ui/Skeleton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useI18n } from "../hooks/useI18n";
import { errorKeysFor } from "../lib/apiError";
import { buttonStyles } from "../lib/buttonStyles";
import { isProcessingStatus } from "../lib/pipelineStatus";
import { formatChunkCount } from "../lib/format";
import { ApiError, documentService } from "../services/documentService";
import type { ChunksResponse, DocumentDetail } from "../types/domain";
import { cn } from "../lib/cn";
import type { TranslationKey } from "../i18n";

type Tab = "overview" | "text" | "chunks" | "embeddings";

const TABS: { id: Tab; labelKey: TranslationKey }[] = [
  { id: "overview", labelKey: "detail.tab.overview" },
  { id: "text", labelKey: "detail.tab.text" },
  { id: "chunks", labelKey: "detail.tab.chunks" },
  { id: "embeddings", labelKey: "detail.tab.embeddings" },
];

function BackLink() {
  const { t } = useI18n();
  return (
    <Link
      to="/documents"
      className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={14} aria-hidden="true" />
      {t("detail.back")}
    </Link>
  );
}

export default function DocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const location = useLocation();
  const { t } = useI18n();
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailErrorCode, setDetailErrorCode] = useState<string | null>(null);
  const [retryingEmbeddings, setRetryingEmbeddings] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [chunkSize, setChunkSize] = useState(512);
  const [chunkOverlap, setChunkOverlap] = useState(100);
  const [chunks, setChunks] = useState<ChunksResponse | null>(null);
  const [chunksLoading, setChunksLoading] = useState(false);
  const [chunksErrorCode, setChunksErrorCode] = useState<string | null>(null);
  const [selectedChunk, setSelectedChunk] = useState(0);

  const loadDetail = useCallback(() => {
    if (!documentId) return;
    const navState = (location.state ?? null) as {
      tab?: Tab;
      chunkIndex?: number;
    } | null;
    documentService
      .get(documentId)
      .then((result) => {
        setDetail(result);
        setChunkSize(result.chunkSize);
        setChunkOverlap(result.chunkOverlap);
        setSelectedChunk(0);
        if (navState?.tab && TABS.some((item) => item.id === navState.tab)) {
          setTab(navState.tab);
        }
        if (
          navState?.chunkIndex !== undefined &&
          Number.isInteger(navState.chunkIndex) &&
          navState.chunkIndex >= 0
        ) {
          setSelectedChunk(navState.chunkIndex);
        }
      })
      .catch(
        (error: unknown) =>
          setDetailErrorCode(error instanceof ApiError ? error.code : "unknown")
      )
      .finally(() => setDetailLoading(false));
  }, [documentId, location.state]);

  const retryDetail = () => {
    setDetailLoading(true);
    setDetailErrorCode(null);
    void loadDetail();
  };

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (!detail) return;
    let cancelled = false;
    documentService
      .chunks(detail.id, { chunkSize, chunkOverlap })
      .then((result) => {
        if (!cancelled) {
          setChunks(result);
          setChunksErrorCode(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setChunksErrorCode(
            error instanceof ApiError ? error.code : "unknown"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setChunksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [detail, chunkSize, chunkOverlap]);

  const applyChunkSize = (size: number) => {
    setChunksLoading(true);
    setSelectedChunk(0);
    setChunkSize(size);
    if (chunkOverlap >= size) {
      setChunkOverlap(Math.floor(size / 4));
    }
  };

  const applyChunkOverlap = (overlap: number) => {
    setChunksLoading(true);
    setSelectedChunk(0);
    setChunkOverlap(overlap);
  };

  const processing = detail !== null && isProcessingStatus(detail.status);
  const documentKey = detail?.id ?? "";

  useEffect(() => {
    if (!processing) return;
    const interval = window.setInterval(() => {
      documentService
        .get(documentKey)
        .then(setDetail)
        .catch(() => undefined);
    }, 1500);
    return () => window.clearInterval(interval);
  }, [documentKey, processing]);

  const retryEmbeddings = () => {
    setRetryingEmbeddings(true);
    documentService
      .reindex(documentKey)
      .then((summary) =>
        setDetail((prev) => (prev ? { ...prev, ...summary } : prev))
      )
      .catch(() => undefined)
      .finally(() => setRetryingEmbeddings(false));
  };

  if (detailLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-96" />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (detailErrorCode || !detail) {
    const meta = errorKeysFor(detailErrorCode ?? "not_found");
    return (
      <div className="space-y-6">
        <BackLink />
        <EmptyState
          icon={AlertTriangle}
          title={t(meta.titleKey)}
          description={t(meta.bodyKey)}
          action={
            <span className="flex gap-3">
              <Button variant="secondary" onClick={retryDetail}>
                {t("common.retry")}
              </Button>
              <Link
                to="/documents"
                className={buttonStyles("primary")}
              >
                {t("detail.back")}
              </Link>
            </span>
          }
        />
      </div>
    );
  }

  const unit =
    detail.pageCount === 1 ? "detail.page.singular" : "detail.page.plural";

  const stats = [
    { id: "pages", label: t("common.pages"), value: formatChunkCount(detail.pageCount) },
    { id: "words", label: t("common.words"), value: formatChunkCount(detail.words) },
    {
      id: "characters",
      label: t("common.characters"),
      value: formatChunkCount(detail.characters),
    },
    {
      id: "chunks",
      label: t("common.chunks"),
      value: formatChunkCount(chunks?.total ?? detail.chunkCount),
    },
  ];

  const handleTabKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = TABS.findIndex((item) => item.id === tab);
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % TABS.length
        : (index - 1 + TABS.length) % TABS.length;
    setTab(TABS[next].id);
    document.getElementById(`tab-${TABS[next].id}`)?.focus();
  };

  return (
    <div className="space-y-6">
      <div>
        <BackLink />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 break-all text-2xl font-semibold tracking-tight text-ink">
            {detail.name}
          </h1>
          <StatusBadge label={t("common.status.ready")} tone="success" />
        </div>
        <p className="mt-1 font-mono text-xs text-faint">
          {t("detail.meta", {
            type: detail.type.toUpperCase(),
            count: `${detail.pageCount} ${t(unit as TranslationKey)}`,
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <MetricCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            icon={<span aria-hidden="true" />}
          />
        ))}
      </div>

      <div
        role="tablist"
        aria-label={detail.name}
        onKeyDown={handleTabKeyDown}
        className="flex gap-1 border-b border-line"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            className={cn(
              "-mb-px rounded-t-md border-b-2 px-4 py-2.5 text-sm transition-colors",
              tab === item.id
                ? "border-accent font-medium text-accent"
                : "border-transparent text-muted hover:bg-elevated hover:text-ink"
            )}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <Card
              title={t("detail.ingest.title")}
              actions={
                detail.status === "error" ? (
                  <Button
                    variant="secondary"
                    onClick={retryEmbeddings}
                    disabled={retryingEmbeddings}
                    className="h-8 px-3 text-xs"
                  >
                    {t("documents.retryEmbed")}
                  </Button>
                ) : undefined
              }
            >
              <div className="px-4 py-4 sm:px-5">
                <IngestionPipeline
                  status={detail.status}
                  errorCode={detail.errorCode}
                />
              </div>
            </Card>
            <Card title={t("detail.cleaning.title")}>
              <div className="space-y-3 px-4 py-4 sm:px-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <StatBox
                    label={t("detail.cleaning.original")}
                    value={formatChunkCount(detail.cleaning.originalCharacters)}
                  />
                  <StatBox
                    label={t("detail.cleaning.cleaned")}
                    value={formatChunkCount(detail.cleaning.cleanedCharacters)}
                  />
                  <StatBox
                    label={t("detail.cleaning.removed")}
                    value={formatChunkCount(detail.cleaning.removedArtifacts)}
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted">
                  {t("detail.ingest.clean.why")}
                </p>
                <Link
                  to="/learn#chunking"
                  className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                >
                  {t("nav.chunking")} →
                </Link>
              </div>
            </Card>
          </div>

          <Card
            title={t("detail.chunking.title")}
            description={t("detail.chunking.applies")}
            actions={
              <button
                type="button"
                onClick={() => setTab("chunks")}
                className="text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                {t("detail.chunks.title")} →
              </button>
            }
          >
            <div className="px-5 py-5 sm:px-6">
              <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <ChunkSettingsPanel
                  chunkSize={chunkSize}
                  chunkOverlap={chunkOverlap}
                  onChangeSize={applyChunkSize}
                  onChangeOverlap={applyChunkOverlap}
                />
                <div className="min-w-0 space-y-4">
                  {chunksLoading && !chunks ? (
                    <Skeleton className="h-40" />
                  ) : (
                    chunks && (
                      <ChunkStrip
                        chunks={chunks.chunks}
                        totalCharacters={detail.characters}
                        chunkOverlap={chunks.chunkOverlap}
                        charactersPerToken={chunks.charactersPerToken}
                        selectedIndex={selectedChunk}
                        onSelect={setSelectedChunk}
                      />
                    )
                  )}
                  <OverlapExplainer overlap={chunkOverlap} />
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <ConceptCard
                  title={t("concept.tokenApprox.title")}
                  body={t("concept.tokenApprox.body")}
                />
                <ConceptCard
                  title={t("detail.chunk.whyTitle")}
                  body={t("detail.chunk.whyBody")}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "text" && (
        <div id="panel-text" role="tabpanel" aria-labelledby="tab-text">
          <ExtractedText pages={detail.pages} />
        </div>
      )}

      {tab === "chunks" && (
        <div id="panel-chunks" role="tabpanel" aria-labelledby="tab-chunks" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {chunks &&
                t("detail.chunks.summary", {
                  total: chunks.total,
                  unit:
                    chunks.total === 1
                      ? t("detail.chunk.singular")
                      : t("detail.chunk.plural"),
                  size: chunks.chunkSize,
                  overlap: chunks.chunkOverlap,
                })}
            </p>
            {chunksLoading && (
              <span className="font-mono text-[11px] text-faint">
                {t("common.running")}…
              </span>
            )}
          </div>
          {chunksErrorCode ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-danger/40 bg-danger-soft px-4 py-3"
            >
              <AlertTriangle size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
              <p className="flex-1 text-sm text-muted">
                {t(errorKeysFor(chunksErrorCode).bodyKey)}
              </p>
            </div>
          ) : (
            chunks && (
              <ChunkBrowser
                chunks={chunks.chunks}
                documentName={detail.name}
                chunkOverlap={chunks.chunkOverlap}
                selected={selectedChunk}
                onSelect={setSelectedChunk}
              />
            )
          )}
        </div>
      )}

      {tab === "embeddings" && (
        <div
          id="panel-embeddings"
          role="tabpanel"
          aria-labelledby="tab-embeddings"
        >
          <EmbeddingsTab detail={detail} />
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-canvas px-3.5 py-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-faint">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
