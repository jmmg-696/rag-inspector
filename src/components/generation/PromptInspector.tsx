import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { Card } from "../ui/Card";
import { cn } from "../../lib/cn";

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
        {title}
      </p>
      <pre className="mt-1.5 max-h-56 overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-line bg-canvas px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted">
        {body}
      </pre>
    </div>
  );
}

export function PromptInspector({
  prompt,
}: {
  prompt: { system: string; context: string; user: string; fullPrompt: string };
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [showFull, setShowFull] = useState(false);

  return (
    <Card
      title={t("playground.prompt.title")}
      description={t("playground.prompt.description")}
      actions={
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line px-3 text-xs text-muted transition-colors hover:bg-elevated hover:text-ink"
        >
          {open ? t("playground.prompt.hide") : t("playground.prompt.view")}
          <ChevronDown
            size={12}
            aria-hidden="true"
            className={cn("transition-transform", open && "rotate-180")}
          />
        </button>
      }
    >
      {open ? (
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <Section title={t("playground.prompt.system")} body={prompt.system} />
          <Section title={t("playground.prompt.context")} body={prompt.context} />
          <Section title={t("playground.prompt.user")} body={prompt.user} />
          <div className="border-t border-line pt-3">
            <button
              type="button"
              onClick={() => setShowFull((prev) => !prev)}
              aria-expanded={showFull}
              className="text-xs font-medium text-accent underline-offset-4 hover:underline"
            >
              {showFull
                ? t("playground.prompt.hide")
                : `${t("playground.prompt.view")} · full`}
            </button>
            {showFull && (
              <pre className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-accent/40 bg-accent-soft/30 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-ink">
                {prompt.fullPrompt}
              </pre>
            )}
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 text-xs text-faint sm:px-6">
          {t("playground.prompt.description")}
        </div>
      )}
    </Card>
  );
}
