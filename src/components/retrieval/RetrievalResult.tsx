import { Radar } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { RetrievedChunk } from "../../types/domain";
import { ChunkCard } from "./ChunkCard";
import { EmptyState } from "../ui/EmptyState";

export function RetrievalResult({ chunks }: { chunks: RetrievedChunk[] }) {
  const { t } = useI18n();
  if (chunks.length === 0) {
    return (
      <EmptyState
        icon={Radar}
        title={t("retrieval.empty.title")}
        description={t("retrieval.empty.body")}
      />
    );
  }
  return (
    <ol className="space-y-3" aria-label={t("retrieval.chunksTitle")}>
      {chunks.map((chunk, index) => (
        <ChunkCard key={chunk.id} chunk={chunk} index={index} />
      ))}
    </ol>
  );
}
