import { useI18n } from "../../hooks/useI18n";
import type { DocumentPageText } from "../../types/domain";
import { EducationalCallout } from "../ui/EducationalCallout";

export function ExtractedText({ pages }: { pages: DocumentPageText[] }) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <EducationalCallout
        title={t("detail.text.whyTitle")}
        body={t("detail.text.whyBody")}
      />
      {pages.map((page) => (
        <section
          key={page.page}
          className="animate-fade-up rounded-xl border border-line bg-surface shadow-sm"
        >
          <header className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-3.5">
            <h3 className="font-mono text-sm font-semibold uppercase tracking-widest text-accent">
              {t("detail.text.page", { page: page.page })}
            </h3>
            <span className="font-mono text-[11px] text-faint">
              {page.characters.toLocaleString("en-US")}{" "}
              {t("common.characters").toLowerCase()}
            </span>
          </header>
          <p className="max-h-[420px] overflow-y-auto whitespace-pre-wrap px-5 py-4 text-sm leading-relaxed text-muted">
            {page.text}
          </p>
        </section>
      ))}
    </div>
  );
}
