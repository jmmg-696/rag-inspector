import { Info } from "lucide-react";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { EvalMetricCard } from "../components/evaluation/EvalMetricCard";
import { EvalResultsTable } from "../components/evaluation/EvalResultsTable";
import { mockEvalMetrics, mockEvalRuns } from "../data/mockEvaluation";

export default function EvaluationPage() {
  const passed = mockEvalRuns.filter((run) => run.status === "pass").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluation"
        description="Measure the quality of your RAG pipeline."
        badge={<StatusBadge label="Demo metrics" tone="neutral" />}
      />

      <div className="flex items-start gap-2.5 rounded-lg border border-line bg-accent-soft/50 px-4 py-3">
        <Info size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
        <p className="text-sm leading-relaxed text-muted">
          These are hypothetical quality metrics shown with mock data. Real
          evaluation runs (RAGAS-style scoring, golden datasets) arrive with
          the pipeline integration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockEvalMetrics.map((metric) => (
          <EvalMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <Card
        title="Evaluated Queries"
        description={`${passed} of ${mockEvalRuns.length} questions passed all checks in the last demo run.`}
      >
        <div className="pt-1">
          <EvalResultsTable runs={mockEvalRuns} />
        </div>
      </Card>
    </div>
  );
}
