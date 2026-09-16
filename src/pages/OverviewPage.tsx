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
import {
  mockOverviewMetrics,
  mockRecentQueries,
} from "../data/mockOverview";
import { mockPipelineStages } from "../data/mockPipeline";

const metricIcons: Record<string, LucideIcon> = {
  documents: FileText,
  chunks: Layers,
  vectors: Database,
  queries: MessagesSquare,
};

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="RAG Inspector"
        description="Understand what happens between a question and an AI-generated answer."
        badge={<StatusBadge label="Local mode" tone="success" pulse />}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {mockOverviewMetrics.map((metric) => {
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
        })}
      </div>

      <Card
        title="RAG Pipeline"
        description="Every answer travels the same path. Hover or click a stage to inspect it."
      >
        <div className="px-5 py-5 sm:px-6">
          <Pipeline stages={mockPipelineStages} />
        </div>
      </Card>

      <Card
        title="Recent Queries"
        description="Latest questions run against the indexed knowledge."
      >
        <div className="pt-1">
          <RecentQueriesTable queries={mockRecentQueries} />
        </div>
      </Card>
    </div>
  );
}
