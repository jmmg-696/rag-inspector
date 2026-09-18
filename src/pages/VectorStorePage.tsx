import { AlertTriangle, Database, ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SemanticSpace } from "../components/vectors/SemanticSpace";
import { VectorHeatmap } from "../components/embeddings/VectorHeatmap";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ConceptCard } from "../components/ui/ConceptCard";
import { EducationalCallout } from "../components/ui/EducationalCallout";
import { EmptyState } from "../components/ui/EmptyState";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/Skeleton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useI18n } from "../hooks/useI18n";
import { formatChunkCount } from "../lib/format";
import { buttonStyles } from "../lib/buttonStyles";
import { vectorStoreService } from "../services/vectorStoreService";
import type {
  SemanticSpace as SemanticSpaceData,
  VectorDetail,
  VectorPoint,
  VectorStats,
  VectorStatus,
} from "../types/domain";

export default function VectorStorePage() {
  const { t } = useI18n();
  const [status, setStatus] = useState<VectorStatus | null>(null);
  const [stats, setStats] = useState<VectorStats | null>(null);
  const [points, setPoints] = useState<VectorPoint[]>([]);
  const [space, setSpace] = useState<SemanticSpaceData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pointDetail, setPointDetail] = useState<VectorDetail | null>(null);
  const [pointLoading, setPointLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    vectorStoreService
      .status()
      .then((result) => {
        setStatus(result);
        if (!result.connected) {
          setLoading(false);
          return;
        }
        let pending = 3;
        const done = () => {
          pending -= 1;
          if (pending <= 0) setLoading(false);
        };
        vectorStoreService
          .stats()
          .then((r) => {
            setStats(r);
            done();
          })
          .catch(done);
        vectorStoreService
          .points(50)
          .then((r) => {
            setPoints(r.points);
            done();
          })
          .catch(done);
        vectorStoreService
          .semanticSpace()
          .then((r) => {
            setSpace(r);
            done();
          })
          .catch(done);
      })
      .catch(() => {
        setStatus({
          connected: false,
          collection: "rag_inspector",
          vectors: 0,
          dimensions: null,
          distance: "Cosine",
          errorCode: "vector_store_unavailable",
        });
        setLoading(false);
      });
  }, []);

  const reload = () => {
    setLoading(true);
    load();
  };

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    vectorStoreService
      .point(selectedId)
      .then((result) => {
        if (!cancelled) setPointDetail(result);
      })
      .catch(() => {
        if (!cancelled) setPointDetail(null);
      })
      .finally(() => {
        if (!cancelled) setPointLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selectPoint = (pointId: string | null) => {
    setSelectedId(pointId);
    setPointLoading(pointId !== null);
  };

  const visibleDetail =
    pointDetail && pointDetail.id === selectedId ? pointDetail : null;

  const offline = status !== null && !status.connected;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("vectorStore.title")}
        description={t("vectorStore.description")}
        badge={
          status === null ? (
            <StatusBadge label={t("backend.checking")} tone="neutral" />
          ) : (
            <StatusBadge
              label={
                status.connected
                  ? `Qdrant · ${t("vectorStore.connected")}`
                  : t("vectorStore.disconnected")
              }
              tone={status.connected ? "success" : "danger"}
              pulse={status.connected}
            />
          )
        }
        actions={
          <Button variant="secondary" onClick={reload}>
            <RefreshCw size={14} aria-hidden="true" />
            {t("vectorStore.retry")}
          </Button>
        }
      />

      {offline && (
        <div
          role="alert"
          className="flex flex-wrap items-start gap-3 rounded-xl border border-danger/40 bg-danger-soft px-5 py-4"
        >
          <AlertTriangle
            size={16}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-danger"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">
              {t("vectorStore.offline.title")}
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-muted">
              {t("vectorStore.offline.body")}
            </p>
          </div>
        </div>
      )}

      {loading && status === null ? (
        <>
          <Skeleton className="h-24" />
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </>
      ) : (
        !offline && (
          <>
            <Card title="Qdrant">
              <div className="grid grid-cols-2 gap-3 px-5 py-5 sm:grid-cols-4">
                <Fact label={t("common.collection")} value={status?.collection ?? "—"} />
                <Fact
                  label={t("vectorStore.stat.vectors")}
                  value={formatChunkCount(stats?.vectors ?? status?.vectors ?? 0)}
                />
                <Fact
                  label={t("common.dimensions")}
                  value={
                    (stats?.dimensions ?? status?.dimensions)
                      ? formatChunkCount(stats?.dimensions ?? status?.dimensions ?? 0)
                      : "—"
                  }
                />
                <Fact
                  label={t("common.distance")}
                  value={status?.distance ?? "Cosine"}
                />
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <MetricCard
                label={t("vectorStore.stat.vectors")}
                value={formatChunkCount(stats?.vectors ?? 0)}
                hint={
                  stats
                    ? t("vectorStore.stat.indexed") + ` · ${stats.indexedPercent}%`
                    : undefined
                }
                icon={<Database size={16} />}
              />
              <MetricCard
                label={t("common.dimensions")}
                value={stats?.dimensions ? formatChunkCount(stats.dimensions) : "—"}
                hint="BGE-M3"
                icon={<span aria-hidden="true" />}
              />
              <MetricCard
                label={t("vectorStore.stat.documents")}
                value={formatChunkCount(stats?.documents ?? 0)}
                icon={<span aria-hidden="true" />}
              />
              <MetricCard
                label={t("vectorStore.stat.avgChunks")}
                value={
                  stats && stats.documents > 0
                    ? String(stats.averageChunksPerDocument)
                    : "—"
                }
                hint={
                  stats
                    ? t("embeddings.generated", {
                        embedded: stats.embeddedChunks,
                        total: stats.totalChunks,
                      })
                    : undefined
                }
                icon={<span aria-hidden="true" />}
              />
            </div>

            {space && space.points.length === 0 ? (
              <EmptyState
                icon={Database}
                title={t("vectorStore.empty.title")}
                description={t("vectorStore.empty.body")}
                action={
                  <Link to="/documents" className={buttonStyles("primary")}>
                    {t("emptyPipeline.upload")}
                  </Link>
                }
              />
            ) : (
              <Card title={t("vectorStore.space.title")}>
                <div className="space-y-4 px-5 py-5 sm:px-6">
                  {space && (
                    <div className="h-80 sm:h-96">
                      <SemanticSpace
                        space={space}
                        totalVectors={stats?.vectors ?? 0}
                        selectedId={selectedId}
                        onSelect={selectPoint}
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                        {t("vectorStore.space.legendChunk")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-strong" aria-hidden="true" />
                        {t("vectorStore.space.legendSame")}
                      </span>
                    </div>
                  </div>
                  <EducationalCallout
                    title={t("vectorStore.space.title")}
                    body={t("vectorStore.space.body", {
                      dimensions: formatChunkCount(
                        stats?.dimensions ?? 1024
                      ),
                    })}
                  />
                </div>
              </Card>
            )}

            <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start">
              <Card title={t("vectorStore.browserTitle")}>
                <div className="px-4 py-3">
                  <p className="mb-2 font-mono text-[11px] text-faint">
                    {t("vectorStore.pagePosition", {
                      shown: points.length,
                      total: stats?.vectors ?? 0,
                    })}
                  </p>
                  <ul className="max-h-[440px] space-y-1 overflow-y-auto">
                    {points.map((point) => (
                      <li key={point.id}>
                        <button
                          type="button"
                          onClick={() => selectPoint(point.id)}
                          aria-pressed={selectedId === point.id}
                          className={
                            selectedId === point.id
                              ? "flex w-full items-center gap-3 rounded-lg bg-accent-soft px-3 py-2 text-left text-sm font-medium text-accent"
                              : "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-elevated hover:text-ink"
                          }
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">
                              {point.documentName}
                            </span>
                            <span className="mt-0.5 block font-mono text-[10px] text-faint">
                              {t("vectorStore.pointPosition", {
                                index: point.chunkIndex,
                                page: point.pageStart,
                              })}
                            </span>
                          </span>
                          <StatusBadge
                            label={t("common.indexed")}
                            tone="success"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <div>
                {selectedId === null && (
                  <EmptyState
                    icon={Database}
                    title={t("vectorStore.browserTitle")}
                    description={t("vectorStore.browserHint")}
                  />
                )}
                {pointLoading && !visibleDetail && (
                  <Skeleton className="h-64" />
                )}
                {visibleDetail && (
                  <div className="animate-fade-up rounded-xl border border-line bg-surface p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-ink">
                          {visibleDetail.documentName}
                        </h3>
                        <p className="mt-0.5 font-mono text-[11px] text-faint">
                          {t("vectorStore.pointPosition", {
                            index: visibleDetail.chunkIndex,
                            page: visibleDetail.pageStart,
                          })}{" "}
                          · {t("embeddings.dimensionsValue", {
                            count: formatChunkCount(visibleDetail.dimensions),
                          })}
                        </p>
                      </div>
                      <Link
                        to={`/documents/${visibleDetail.documentId}`}
                        className={buttonStyles("secondary", "h-8 px-3 text-xs")}
                      >
                        <ExternalLink size={12} aria-hidden="true" />
                        {t("vectorStore.openDocument")}
                      </Link>
                    </div>
                    <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">
                      “{visibleDetail.text.slice(0, 200)}
                      {visibleDetail.text.length > 200 ? "…" : ""}”
                    </p>
                    <div className="mt-4">
                      <VectorHeatmap vector={visibleDetail.vector} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ConceptCard
                title={t("embeddings.whatTitle")}
                body={t("embeddings.whatBody")}
              />
              <ConceptCard
                title={t("embeddings.whyCosineTitle")}
                body={t("embeddings.whyCosine")}
              />
            </div>
            <EducationalCallout
              title={t("embeddings.whyTitle")}
              body={t("embeddings.whyVectorStore")}
            />
          </>
        )
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-canvas px-3.5 py-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-faint">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-sm text-ink">{value}</p>
    </div>
  );
}
