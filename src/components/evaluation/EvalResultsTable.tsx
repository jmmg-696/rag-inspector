import { useI18n } from "../../hooks/useI18n";
import { evalStatusMeta } from "../../lib/evalStatus";
import type { EvalRun } from "../../types/domain";
import { StatusBadge } from "../ui/StatusBadge";

const th =
  "px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-faint first:pl-5";
const td = "px-4 py-3.5 text-sm text-muted first:pl-5";

export function EvalResultsTable({ runs }: { runs: EvalRun[] }) {
  const { t } = useI18n();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <caption className="sr-only">{t("evaluation.runs.title")}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className={th}>
              {t("common.table.query")}
            </th>
            <th scope="col" className={th}>
              {t("evaluation.table.expected")}
            </th>
            <th scope="col" className={`${th} w-40`}>
              {t("evaluation.table.retrieved")}
            </th>
            <th scope="col" className={`${th} w-20`}>
              {t("evaluation.table.score")}
            </th>
            <th scope="col" className={`${th} w-28`}>
              {t("evaluation.table.status")}
            </th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => {
            const status = evalStatusMeta[run.status];
            return (
              <tr
                key={run.id}
                className="border-b border-line last:border-0 transition-colors hover:bg-elevated/50"
              >
                <td className={`${td} text-ink`}>{run.question}</td>
                <td className={td}>{run.expected}</td>
                <td className={`${td} font-mono text-xs`}>{run.retrieved}</td>
                <td className={`${td} font-mono text-ink`}>
                  {run.score.toFixed(2)}
                </td>
                <td className={td}>
                  <StatusBadge
                    label={t(status.labelKey)}
                    tone={status.tone}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
