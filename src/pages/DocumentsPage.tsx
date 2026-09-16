import { PageHeader } from "../components/ui/PageHeader";

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Documents"
        description="Manage the knowledge used by your RAG pipeline."
      />
    </div>
  );
}
