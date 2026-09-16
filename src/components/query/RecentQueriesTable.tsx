import type { RecentQuery } from "../../types/domain";
import { SimilarityBar } from "../ui/SimilarityBar";

const th =
  "px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-faint first:pl-5";
const td = "px-4 py-3.5 text-sm text-muted first:pl-5";

export function RecentQueriesTable({ queries }: { queries: RecentQuery[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <caption className="sr-only">Recent queries</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className={th}>
              Query
            </th>
            <th scope="col" className={`${th} w-40`}>
              Retrieval score
            </th>
            <th scope="col" className={`${th} w-20`}>
              Chunks
            </th>
            <th scope="col" className={`${th} w-28`}>
              Response time
            </th>
            <th scope="col" className={`${th} w-24`}>
              Ran
            </th>
          </tr>
        </thead>
        <tbody>
          {queries.map((query) => (
            <tr
              key={query.id}
              className="border-b border-line last:border-0 transition-colors hover:bg-elevated/50"
            >
              <td className={`${td} text-ink`}>{query.question}</td>
              <td className={td}>
                <div className="flex items-center gap-2.5">
                  <SimilarityBar
                    value={query.score}
                    tone={query.score >= 0.9 ? "success" : "accent"}
                    className="w-24"
                  />
                  <span className="font-mono text-xs text-ink">
                    {query.score.toFixed(2)}
                  </span>
                </div>
              </td>
              <td className={`${td} font-mono`}>{query.chunks}</td>
              <td className={`${td} font-mono`}>{query.responseTimeMs} ms</td>
              <td className={td}>{query.ranAgo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
