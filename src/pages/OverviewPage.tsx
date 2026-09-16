import {
  Database,
  FileText,
  Layers,
  MessagesSquare,
  Binary,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Pipeline } from "../components/pipeline/Pipeline";
import { RecentQueriesTable } from "../components/query/RecentQueriesTable";
import { useI18n } from "../hooks/useI18n";
import { usePipelineStages } from "../hooks/usePipelineStages";
import { formatChunkCount } from "../lib/format";
import { buttonStyles } from "../lib/buttonStyles";
import { documentService } from "../services/documentService";
import { vectorStoreService } from "../services/vectorStoreService";
import { mockOverviewMetrics } from "../data/mockOverview";
import { mockRecentQueries } from "../data/mockQueries";
import { mockPipelineStages } from "../data/mockPipeline";
import type { TranslationKey } from "../i18n";
import type { DocumentSummary, VectorStats } from "../types/domain";

interface LiveOverview {
  documents: DocumentSummary[];
  stats: VectorStats | null;
  qdrantConnected: boolean;
}

const metricIcons: Record<string, LucideIcon> = {
  documents: FileText,
  chunks: Layers,
  vectors: Database,
  queries: MessagesSquare,
  embeddings: Binary,
};

export default function OverviewPage() {
  const { t } = useI18n();
  const stages = usePipelineStages(mockPipelineStages);
  const [live, setLive] = useState<LiveOverview | null>(null);

  useEffect(() => {
    documentService
      .health()
      .then((info) => {
        if (!info || info.api !== "ok") return;
        const connected = info.qdrant === "ok";
        Promise.all([
          documentService.list(),
          connected
            ? vectorStoreService.stats().catch(() => null)
            : Promise.resolve(null),
        ])
          .then(([documents, stats]) => setLive({ documents, stats, qdrantConnected: connected }))
          .catch(() => undefined);
      })
      .catch(() => undefined);
  }, []);

  const totalChunks = live
    ? live.documents.reduce((sum, doc) => sum + doc.chunkCount, 0)
    : 0;
  const totalEmbeddings = live
    ? live.documents.reduce((sum, doc) => sum + doc.embeddingCount, 0)
    : 0;

  const liveMetrics = live
    ? [
        {
          id: "documents",
          label: t("overview.metric.documents"),
          value: formatChunkCount(live.documents.length),
          hint: t("overview.metric.documentsLiveHint"),
        },
        {
          id: "chunks",
          label: t("overview.metric.chunks"),
          value: formatChunkCount(totalChunks),
          hint: t("overview.metric.chunksLiveHint"),
        },
        {
          id: "embeddings",
          label: t("overview.metric.embeddings"),
          value: formatChunkCount(totalEmbeddings),
          hint: t("overview.metric.embeddingsHint"),
        },
        {
          id: "vectors",
          label: t("overview.metric.vectors"),
          value: formatChunkCount(live.stats?.vectors ?? 0),
          hint: t("overview.metric.vectorsLiveHint"),
        },
      ]
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("app.name")}
        description={t("overview.description")}
        badge={
          <StatusBadge label={t("overview.badgeLocal")} tone="success" pulse />
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {liveMetrics
          ? liveMetrics.map((metric) => {
              const Icon = metricIcons[metric.id];
              return (
                <MetricCard
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  hint={metric.hint}
                  icon={<Icon size={16} />}
                />
              );
            })
          : mockOverviewMetrics.map((metric) => {
              const Icon = metricIcons[metric.id];
              return (
                <MetricCard
                  key={metric.id}
                  label={t(`overview.metric.${metric.id}` as TranslationKey)}
                  value={metric.value}
                  hint={t(
                    `overview.metric.${metric.id}Hint` as TranslationKey
                  )}
                  icon={<Icon size={16} />}
                />
              );
            })}
      </div>

      {live && (
        <Card
          title={t("overview.vectorStore.title")}
          description={
            live.qdrantConnected
              ? t("vectorStore.description")
              : t("vectorStore.offline.body")
          }
          actions={
            <Link
              to="/vector-store"
              className={buttonStyles("secondary", "h-8 px-3 text-xs")}
            >
              {t("overview.vectorStore.open")}
            </Link>
          }
        >
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-5 sm:px-6">
            <span className="flex items-center gap-2">
              <Database size={16} aria-hidden="true" className="text-accent" />
              <span className="font-mono text-sm font-semibold text-ink">
                Qdrant
              </span>
              <StatusBadge
                label={
                  live.qdrantConnected && live.stats
                    ? t("vectorStore.connected")
                    : t("vectorStore.disconnected")
                }
                tone={live.qdrantConnected && live.stats ? "success" : "danger"}
                pulse={live.qdrantConnected}
              />
            </span>
            <span className="font-mono text-xs text-muted">
              {t("overview.vectorStore.vectors", {
                count: formatChunkCount(live.stats?.vectors ?? 0),
              })}
            </span>
            <span className="font-mono text-xs text-muted">
              {t("overview.vectorStore.dimensions", {
                count: formatChunkCount(live.stats?.dimensions ?? 0),
              })}
            </span>
          </div>
        </Card>
      )}

      <Card
        title={t("overview.pipeline.title")}
        description={t("overview.pipeline.description")}
      >
        <div className="px-5 py-5 sm:px-6">
          <Pipeline stages={stages} />
        </div>
      </Card>

      <Card
        title={t("overview.recent.title")}
        description={t("overview.recent.description")}
      >
        <div className="pt-1">
          <RecentQueriesTable queries={mockRecentQueries} />
        </div>
      </Card>
    </div>
  );
}
