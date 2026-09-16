import { useMemo, useState } from "react";
import { Search, Upload, UploadCloud, FileSearch } from "lucide-react";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { DocumentCard } from "../components/documents/DocumentCard";
import { DocumentDetails } from "../components/documents/DocumentDetails";
import { DocumentTable } from "../components/documents/DocumentTable";
import { mockDocuments } from "../data/mockDocuments";
import type { KnowledgeDocument } from "../types/domain";

export default function DocumentsPage() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<KnowledgeDocument | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return mockDocuments;
    return mockDocuments.filter((document) =>
      document.name.toLowerCase().includes(term)
    );
  }, [filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Manage the knowledge used by your RAG pipeline."
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <Upload size={15} aria-hidden="true" />
            Upload document
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex-1 basis-64">
          <span className="sr-only">Search documents</span>
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search documents…"
            className="h-9 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-faint"
          />
        </label>
        <p className="font-mono text-xs text-faint">
          {filtered.length} of {mockDocuments.length} documents
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No documents match your search"
          description={`Nothing indexed contains “${filter.trim()}”. Try a different term.`}
          action={
            <Button variant="secondary" onClick={() => setFilter("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <>
          <div className="hidden rounded-xl border border-line bg-surface shadow-sm md:block">
            <DocumentTable documents={filtered} onSelect={setSelected} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:hidden">
            {filtered.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onSelect={setSelected}
              />
            ))}
          </div>
        </>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Document details"
      >
        {selected && <DocumentDetails document={selected} />}
      </Modal>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload document"
      >
        <div className="space-y-5">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-canvas px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-elevated text-faint">
              <UploadCloud size={22} aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-medium text-ink">
              Drop PDF or Markdown files here
            </p>
            <p className="mt-1 text-sm text-muted">
              Or browse from your machine — up to 50 MB per file.
            </p>
            <div className="mt-4">
              <StatusBadge label="Coming soon" tone="neutral" />
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Real document ingestion — parsing, chunking and local embeddings —
            ships in an upcoming phase. This prototype shows the intended
            workflow with mock data.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" disabled>
              Browse files
            </Button>
            <Button onClick={() => setUploadOpen(false)}>Got it</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
