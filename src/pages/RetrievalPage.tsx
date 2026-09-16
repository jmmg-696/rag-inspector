import { PageHeader } from "../components/ui/PageHeader";

export default function RetrievalPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Retrieval Inspector"
        description="See which chunks your RAG system actually retrieves."
      />
    </div>
  );
}
