import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="404 — This page is not in the knowledge base"
      description="The route you requested could not be retrieved from this application."
      action={
        <Link
          to="/"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-strong dark:text-[#0b0d10]"
        >
          Back to Overview
        </Link>
      }
    />
  );
}
