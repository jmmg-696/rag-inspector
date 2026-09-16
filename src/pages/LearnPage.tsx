import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LearnVisualBlock } from "../components/learn/LearnVisualBlock";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { buttonStyles } from "../lib/buttonStyles";
import { mockLearnSections } from "../data/mockLearn";

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="How RAG works"
        description="Retrieval-Augmented Generation, step by step — no hand-waving, no magic."
        badge={<StatusBadge label="Learning mode" tone="accent" />}
      />

      <div className="rounded-xl border border-line bg-surface px-6 py-9 text-center shadow-sm sm:py-12">
        <p className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          RAG shouldn&rsquo;t be a black box.
        </p>
        <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-muted">
          It is a pipeline. Every step is visible, inspectable and testable.
          Here is what happens between your question and the answer.
        </p>
      </div>

      <div className="space-y-4">
        {mockLearnSections.map((section) => (
          <article
            key={section.id}
            id={section.id}
            className="scroll-mt-20 rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-8">
              <div>
                <p className="font-mono text-xs font-medium text-accent">
                  {section.step}
                </p>
                <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-ink">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {section.text}
                </p>
              </div>
              <div className="rounded-lg border border-line bg-canvas p-4 sm:p-5">
                <LearnVisualBlock visual={section.visual} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-surface px-6 py-8 text-center shadow-sm sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-sm font-semibold text-ink">
            Ready to see it on your own questions?
          </p>
          <p className="mt-0.5 text-sm text-muted">
            The Playground runs the same pipeline with visible sources.
          </p>
        </div>
        <Link to="/playground" className={buttonStyles("primary")}>
          Open Playground
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
