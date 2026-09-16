import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="RAG Inspector"
        description="Understand what happens between a question and an AI-generated answer."
        badge={<StatusBadge label="Local mode" tone="success" pulse />}
      />
      <p className="text-lg font-medium text-ink">
        RAG shouldn&rsquo;t be a black box.
      </p>
    </div>
  );
}
