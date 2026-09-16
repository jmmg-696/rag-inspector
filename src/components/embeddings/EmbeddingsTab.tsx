import {
  ArrowRight,
  Binary,
  Boxes,
  CircleCheck,
  Database,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../hooks/useI18n";
import type { TranslationKey } from "../../i18n";
import { formatChunkCount } from "../../lib/format";
import { embeddingService, vectorStoreService } from "../../services/vectorStoreService";
import type { EmbeddingPreview } from "../../services/vectorStoreService";
import type {
  DocumentDetail,
  EmbeddingModelMeta,
  VectorDetail,
  VectorPoint,
  VectorStatus,
} from "../../types/domain";
import { EducationalCallout } from "../ui/EducationalCallout";
import { ConceptCard } from "../ui/ConceptCard";
import { Skeleton } from "../ui/Skeleton";
import { StatusBadge } from "../ui/StatusBadge";
import { VectorHeatmap } from "./VectorHeatmap";
import { cn } from "../../lib/cn";

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-canvas px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function FlowChips({
  chunkIndex,
  dimensions,
  indexed,
}: {
  chunkIndex: number;
  dimensions: number | null;
  indexed: boolean;
}) {
  const { t } = useI18n();
  const nodes: { label: string; icon: typeof Boxes }[] = [
    { label: t("embeddings.chunkLabel", { index: chunkIndex }), icon: Boxes },
    { label: t("pipeline.stages.embeddings.label" as TranslationKey), icon: Binary },
    {
      label: dimensions
        ? t("embeddings.flowCaption", { count: formatChunkCount(dimensions) })
        : "…",
      icon: Database,
    },
    { label: "Qdrant", icon: CircleCheck },
  ];
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3"
      )}
      aria-label={t("embeddings.listTitle")}
    >
      {nodes.map((node, index) => (
        <span key={node.label} className="flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs",
              index === nodes.length - 1 && indexed
                ? "border-success/40 bg-success-soft text-success"
                : "border-line text-muted"
            )}
          >
            <node.icon size={12} aria-hidden="true" />
            {node.label}
          </span>
          {index < nodes.length - 1 && (
            <ArrowRight size={12} aria-hidden="true" className="text-faint" />
          )}
        </span>
      ))}
    </div>
  );
}

function VectorPanel({
  documentId,
  point,
}: {
  documentId: string;
  point: VectorPoint | null;
}) {
  const { t } = useI18n();
  const [detail, setDetail] = useState<VectorDetail | null>(null);
  const [preview, setPreview] = useState<EmbeddingPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(false);

  if (!point) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-surface px-5 py-10 text-center text-sm text-faint">
        {t("detail.chunk.selectedHint")}
      </p>
    );
  }

  const loadStoredVector = () => {
    setLoading(true);
    setError(false);
    vectorStoreService
      .point(point.id)
      .then(setDetail)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  const computePreview = () => {
    setLoading(true);
    setError(false);
    embeddingService
      .preview(documentId, point.chunkIndex)
      .then(setPreview)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  return (
    <div className="animate-fade-up rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
          {t("embeddings.chunkLabel", { index: point.chunkIndex })}
        </p>
        <StatusBadge
          label={t("common.indexed")}
          tone="success"
        />
      </div>
      <p className="mt-1 font-mono text-[11px] text-faint">
        {t("vectorStore.pointPosition", {
          index: point.chunkIndex,
          page: point.pageStart,
        })}{" "}
        · {point.estimatedTokens} {t("common.tokens").toLowerCase()}
      </p>

      {!detail && !preview && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadStoredVector}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3.5 text-sm text-ink transition-colors hover:bg-elevated disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <Binary size={14} aria-hidden="true" />
            )}
            {t("common.viewVector")}
          </button>
          <button
            type="button"
            onClick={computePreview}
            disabled={loading}
            className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline disabled:opacity-50"
          >
            {loading ? t("embeddings.previewing") : t("embeddings.previewButton")}
          </button>
        </div>
      )}
      {error && (
        <p className="mt-3 text-sm text-danger">
          {t("error.vector_store_unavailable.body")}
        </p>
      )}

      {preview && !detail && (
        <div className="mt-4">
          <p className="font-mono text-xs leading-relaxed text-accent">
            [{preview.vectorPreview.map((v) => v.toFixed(3)).join(", ")}, …]
          </p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
            {preview.dimensions} {t("common.dimensions").toLowerCase()} ·{" "}
            {preview.model}
          </p>
          <p className="mt-1 text-xs text-muted">{t("embeddings.previewNote")}</p>
          <p className="mt-2 font-mono text-[11px] text-faint">
            point · {preview.pointId.slice(0, 8)}…
          </p>
        </div>
      )}

      {detail && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              {t("embeddings.storedVector")}
            </p>
            <p className="mt-1.5 font-mono text-xs leading-relaxed text-accent">
              [
              {detail.vector
                .slice(0, 6)
                .map((v) => v.toFixed(3))
                .join(", ")}
              , …]
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="inline-flex h-8 items-center rounded-md border border-line px-3 text-xs text-muted transition-colors hover:bg-elevated hover:text-ink"
          >
            {expanded ? t("common.hideVector") : t("common.viewVector")}
          </button>
          {expanded && (
            <div className="animate-fade-up">
              <VectorHeatmap vector={detail.vector} />
            </div>
          )}
          <p className="border-t border-line pt-3 text-xs leading-relaxed text-muted">
            {detail.text.slice(0, 220)}
            {detail.text.length > 220 ? "…" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

export function EmbeddingsTab({ detail }: { detail: DocumentDetail }) {
  const { t } = useI18n();
  const [model, setModel] = useState<EmbeddingModelMeta | null>(null);
  const [store, setStore] = useState<VectorStatus | null>(null);
  const [points, setPoints] = useState<VectorPoint[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    embeddingService.model().then(setModel).catch(() => undefined);
    vectorStoreService.status().then(setStore).catch(() => undefined);
  }, []);

  useEffect(() => {
    vectorStoreService
      .points(200)
      .then((result) =>
        setPoints(
          result.points
            .filter((point) => point.documentId === detail.id)
            .sort((a, b) => a.chunkIndex - b.chunkIndex)
        )
      )
      .catch(() => setPoints([]));
  }, [detail.id, detail.embeddingCount]);

  const indexedPoints = useMemo(
    () => (points ?? []).filter((point) => point.documentId === detail.id),
    [points, detail.id]
  );
  const selectedPoint =
    indexedPoints.find((point) => point.chunkIndex === selected) ??
    indexedPoints[0] ??
    null;
  const dimensions = model?.dimensions ?? store?.dimensions ?? null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetaItem
          label={t("common.embeddings")}
          value={t("embeddings.generated", {
            embedded: detail.embeddingCount,
            total: detail.chunkCount,
          })}
        />
        <MetaItem label={t("embeddings.model")} value={model?.model ?? "—"} />
        <MetaItem
          label={t("common.dimensions")}
          value={
            dimensions
              ? t("embeddings.dimensionsValue", {
                  count: formatChunkCount(dimensions),
                })
              : "—"
          }
        />
        <MetaItem
          label={t("embeddings.vectorStore")}
          value={
            store && store.connected
              ? `Qdrant · ${store.collection}`
              : t("vectorStore.disconnected")
          }
        />
      </div>

      {dimensions && (
        <p className="text-xs leading-relaxed text-muted">
          {t("embeddings.dimensionsExplain", {
            count: formatChunkCount(dimensions),
          })}
        </p>
      )}

      <FlowChips
        chunkIndex={selectedPoint?.chunkIndex ?? 0}
        dimensions={dimensions}
        indexed={detail.embeddingCount > 0}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-xl border border-line bg-surface shadow-sm">
          <p className="border-b border-line px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-faint">
            {t("embeddings.listTitle")}
          </p>
          {points === null ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : indexedPoints.length === 0 ? (
            <p className="p-4 text-sm text-muted">{t("embeddings.notIndexed")}</p>
          ) : (
            <ul className="max-h-[380px] overflow-y-auto p-2">
              {indexedPoints.map((point) => (
                <li key={point.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(point.chunkIndex)}
                    aria-pressed={
                      (selectedPoint?.chunkIndex ?? 0) === point.chunkIndex
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      (selectedPoint?.chunkIndex ?? 0) === point.chunkIndex
                        ? "bg-accent-soft font-medium text-accent"
                        : "text-muted hover:bg-elevated hover:text-ink"
                    )}
                  >
                    <span className="font-mono text-xs">
                      {t("embeddings.chunkLabel", { index: point.chunkIndex })}
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-faint">
                      {t("detail.chunk.page", { page: point.pageStart })}
                    </span>
                    <CircleCheck
                      size={13}
                      aria-label={t("common.indexed")}
                      className="shrink-0 text-success"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <VectorPanel
          key={selectedPoint?.id ?? "none"}
          documentId={detail.id}
          point={selectedPoint}
        />
      </div>

      <ConceptCard
        title={t("embeddings.whatTitle")}
        body={t("embeddings.whatBody")}
      />
      <EducationalCallout
        title={t("embeddings.whyTitle")}
        body={t("embeddings.whyEmbeddings")}
      />

      <div className="flex justify-end">
        <Link
          to="/vector-store"
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          {t("overview.vectorStore.open")} →
        </Link>
      </div>
    </div>
  );
}
