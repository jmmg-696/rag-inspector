import {
  Database,
  FileText,
  Layers,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Pipeline } from "../components/pipeline/Pipeline";
import { RecentQueriesTable } from "../components/query/RecentQueriesTable";
import { useI18n } from "../hooks/useI18n";
import { usePipelineStages } from "../hooks/usePipelineStages";
import { mockOverviewMetrics } from "../data/mockOverview";
import { mockRecentQueries } from "../data/mockQueries";
import { mockPipelineStages } from "../data/mockPipeline";
import type { TranslationKey } from "../i18n";

const metricIcons: Record<string, LucideIcon> = {
  documents: FileText,
  chunks: Layers,
  vectors: Database,
  queries: MessagesSquare,
};

export default function OverviewPage() {
  const { t } = useI18n();
  const stages = usePipelineStages(mockPipelineStages);

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
        {mockOverviewMetrics.map((metric) => {
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
