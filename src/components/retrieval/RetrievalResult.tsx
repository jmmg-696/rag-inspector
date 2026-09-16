import { Radar } from "lucide-react";
import type { RetrievedChunk } from "../../types/domain";
import { ChunkCard } from "./ChunkCard";
import { EmptyState } from "../ui/EmptyState";

export function RetrievalResult({ chunks }: { chunks: RetrievedChunk[] }) {
  if (chunks.length === 0) {
    return (
      <EmptyState
        icon={Radar}
        title="No chunks crossed the similarity threshold"
        description="Nothing in the index was close enough to this query. Try asking something else in the Playground."
      />
    );
  }
  return (
    <ol className="space-y-3" aria-label="Retrieved chunks">
      {chunks.map((chunk, index) => (
        <ChunkCard key={chunk.id} chunk={chunk} index={index} />
      ))}
    </ol>
  );
}
