import { X } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { EvalRunRecord } from "../../types/domain";

function pct(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value * 1000) / 10}%`;
}

export function ExperimentsTable({
  records,
  onRemove,
}: {
  records: EvalRunRecord[];
  onRemove: (runId: string) => void;
}) {
  const { t } = useI18n();
  if (records.length === 0) {
    return (
      <p className="px-5 py-6 text-sm text-faint sm:px-6">
        {t("evaluation.noExperiments")}
      </p>
    );
  }
  const rows: { label: string; value: (r: EvalRunRecord) => string }[] = [
    { label: t("evaluation.topK"), value: (r) => String(r.topK) },
    {
      label: t("evaluation.threshold"),
      value: (r) => r.scoreThreshold.toFixed(2),
    },
    {
      label: t("evaluation.generation"),
      value: (r) => (r.generationEnabled ? r.llmModel ?? "on" : "off"),
    },
    {
      label: t("evaluation.hitRate"),
      value: (r) => pct(r.retrievalMetrics.hitRateAtK),
    },
    {
      label: t("evaluation.recall"),
      value: (r) => pct(r.retrievalMetrics.recallAtK),
    },
    {
      label: t("evaluation.precision"),
      value: (r) => pct(r.retrievalMetrics.precisionAtK),
    },
    {
      label: "MRR",
      value: (r) => r.retrievalMetrics.mrr.toFixed(2),
    },
    {
      label: t("evaluation.citationCoverage"),
      value: (r) => pct(r.citationCoverage),
    },
    {
      label: t("evaluation.validCitationRate"),
      value: (r) => pct(r.validCitationRate),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <caption className="sr-only">{t("evaluation.experiments")}</caption>
        <thead>
          <tr className="border-b border-line">
            <th
              scope="col"
              className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-faint sm:pl-6"
            >
              {t("evaluation.metric")}
            </th>
            {records.map((record) => (
              <th
                key={record.runId}
                scope="col"
                className="px-4 py-2.5 text-right font-mono text-[10px] uppercase tracking-widest text-faint"
              >
                <span className="flex items-center justify-end gap-1.5">
                  {new Date(record.createdAt).toLocaleString()}
                  <button
                    type="button"
                    onClick={() => onRemove(record.runId)}
                    aria-label={`${t("evaluation.removeRun")} ${record.runId}`}
                    className="inline-flex h-5 w-5 items-center justify-center rounded text-faint transition-colors hover:bg-elevated hover:text-ink"
                  >
                    <X size={11} aria-hidden="true" />
                  </button>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-line last:border-0"
            >
              <td className="px-4 py-2.5 text-sm text-muted sm:pl-6">
                {row.label}
              </td>
              {records.map((record) => (
                <td
                  key={record.runId}
                  className="px-4 py-2.5 text-right font-mono text-xs text-ink"
                >
                  {row.value(record)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-faint sm:px-6">
        {t("evaluation.experimentsDisclaimer")}
      </p>
    </div>
  );
}
