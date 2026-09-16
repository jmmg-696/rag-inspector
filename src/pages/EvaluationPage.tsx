import { Info } from "lucide-react";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { EvalMetricCard } from "../components/evaluation/EvalMetricCard";
import { EvalResultsTable } from "../components/evaluation/EvalResultsTable";
import { useI18n } from "../hooks/useI18n";
import { mockEvalMetrics, mockEvalRuns } from "../data/mockEvaluation";
import type { TranslationKey } from "../i18n";

export default function EvaluationPage() {
  const { t } = useI18n();
  const passed = mockEvalRuns.filter((run) => run.status === "pass").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("evaluation.title")}
        description={t("evaluation.description")}
        badge={<StatusBadge label={t("evaluation.badge")} tone="neutral" />}
      />

      <div className="flex items-start gap-2.5 rounded-lg border border-line bg-accent-soft/50 px-4 py-3">
        <Info size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
        <p className="text-sm leading-relaxed text-muted">
          {t("evaluation.notice")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockEvalMetrics.map((metric) => (
          <EvalMetricCard
            key={metric.id}
            label={t(`evaluation.metric.${metric.id}.label` as TranslationKey)}
            description={t(
              `evaluation.metric.${metric.id}.description` as TranslationKey
            )}
            value={metric.value}
          />
        ))}
      </div>

      <Card
        title={t("evaluation.runs.title")}
        description={t("evaluation.runs.description", {
          passed,
          total: mockEvalRuns.length,
        })}
      >
        <div className="pt-1">
          <EvalResultsTable runs={mockEvalRuns} />
        </div>
      </Card>
    </div>
  );
}
