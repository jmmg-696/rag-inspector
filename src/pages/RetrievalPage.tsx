import { Link } from "react-router-dom";
import { MessageSquareText } from "lucide-react";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { RetrievalResult } from "../components/retrieval/RetrievalResult";
import { buttonStyles } from "../lib/buttonStyles";
import {
  mockIndexedChunkCount,
  mockRetrievalQuery,
  mockRetrievalSettings,
  mockRetrievedChunks,
} from "../data/mockRetrieval";

export default function RetrievalPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Retrieval Inspector"
        description="See which chunks your RAG system actually retrieves."
        badge={<StatusBadge label="Mocked retrieval" tone="neutral" />}
      />

      <Card>
        <div className="px-5 py-5 sm:px-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            Query
          </p>
          <p className="mt-2 text-lg font-medium tracking-tight text-ink">
            {mockRetrievalQuery}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge label={`top_k = ${mockRetrievalSettings.topK}`} />
            <StatusBadge
              label={`threshold ≥ ${mockRetrievalSettings.threshold.toFixed(2)}`}
            />
            <StatusBadge label={mockRetrievalSettings.embedding} />
            <StatusBadge label={mockRetrievalSettings.index} />
          </div>
        </div>
      </Card>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              Retrieved Chunks
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {mockRetrievedChunks.length} of{" "}
              {mockIndexedChunkCount.toLocaleString("en-US")} indexed chunks,
              ranked by semantic similarity.
            </p>
          </div>
          <Link
            to="/playground"
            className={buttonStyles("secondary", "h-8 px-3 text-xs")}
          >
            <MessageSquareText size={13} aria-hidden="true" />
            Try another query
          </Link>
        </div>

        <div className="mt-4">
          <RetrievalResult chunks={mockRetrievedChunks} />
        </div>
      </div>
    </div>
  );
}
