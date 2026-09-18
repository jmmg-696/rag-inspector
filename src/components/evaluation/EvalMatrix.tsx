import { useI18n } from "../../hooks/useI18n";
import type { EvalCaseResult } from "../../types/domain";
import { cn } from "../../lib/cn";

export function EvalMatrix({
  cases,
  topK,
  selectedId,
  onSelect,
}: {
  cases: EvalCaseResult[];
  topK: number;
  selectedId: string | null;
  onSelect: (questionId: string) => void;
}) {
  const { t } = useI18n();
  const columns = Array.from({ length: topK }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <caption className="sr-only">{t("evaluation.matrixTitle")}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-faint">
              {t("evaluation.question")}
            </th>
            {columns.map((rank) => (
              <th
                key={rank}
                scope="col"
                className="px-3 py-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint"
              >
                #{rank}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.map((caseResult) => {
            const cellFor = (rank: number) => {
              const hit = caseResult.retrieved.find(
                (item) => item.rank === rank
              );
              if (!hit) return null;
              return hit.relevant;
            };
            return (
              <tr
                key={caseResult.questionId}
                onClick={() => onSelect(caseResult.questionId)}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(caseResult.questionId);
                  }
                }}
                aria-label={`${caseResult.questionId}: ${caseResult.question}`}
                className={cn(
                  "cursor-pointer border-b border-line last:border-0 transition-colors hover:bg-elevated/50",
                  selectedId === caseResult.questionId && "bg-accent-soft/40"
                )}
              >
                <td className="max-w-72 truncate px-3 py-2.5">
                  <span className="font-mono text-[11px] text-accent">
                    {caseResult.questionId.toUpperCase()}
                  </span>{" "}
                  <span className="text-muted">
                    {caseResult.skipped
                      ? t("evaluation.skippedCase")
                      : caseResult.question}
                  </span>
                </td>
                {columns.map((rank) => {
                  const relevant = cellFor(rank);
                  return (
                    <td key={rank} className="px-3 py-2.5 text-center">
                      {relevant === true && (
                        <span
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-success-soft font-mono text-xs text-success"
                          title={t("evaluation.relevant")}
                        >
                          ✓
                        </span>
                      )}
                      {relevant === false && (
                        <span
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs text-faint"
                          title={t("evaluation.notAnnotated")}
                        >
                          ·
                        </span>
                      )}
                      {relevant === null && (
                        <span className="text-faint/50" aria-hidden="true">
                          –
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-faint">
        ✓ {t("evaluation.relevant")} · · {t("evaluation.notAnnotated")} · –{" "}
        {t("evaluation.noResult")}
      </p>
    </div>
  );
}
