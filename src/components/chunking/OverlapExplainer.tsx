import { useI18n } from "../../hooks/useI18n";
import { cn } from "../../lib/cn";

export function OverlapExplainer({ overlap }: { overlap: number }) {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-line bg-canvas px-4 py-3.5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
        {t("detail.overlap.whyTitle")}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        {t("detail.chunking.overlapTip")}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <figure
          className={cn(
            "rounded-md border border-line bg-surface p-3 font-mono text-[11px] leading-relaxed text-muted"
          )}
        >
          <figcaption className="mb-1.5 font-medium text-faint">
            {t("detail.overlap.without")}
          </figcaption>
          <pre aria-hidden="true">{`┌──── A ────┐
└───────────┘┌──── B ────┐
             └───────────┘`}</pre>
        </figure>
        <figure
          className={cn(
            "rounded-md border border-accent/40 bg-accent-soft/40 p-3 font-mono text-[11px] leading-relaxed text-muted"
          )}
        >
          <figcaption className="mb-1.5 font-medium text-accent">
            {t("detail.overlap.with")}
            {overlap > 0 ? ` · ${overlap}` : ""}
          </figcaption>
          <pre aria-hidden="true">{`┌──── A ────┐
└───────────┘
      ┌──── B ────┐
      └───────────┘`}</pre>
        </figure>
      </div>
    </div>
  );
}
