import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LearnVisualBlock } from "../components/learn/LearnVisualBlock";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useI18n } from "../hooks/useI18n";
import { buttonStyles } from "../lib/buttonStyles";
import { mockLearnSections } from "../data/mockLearn";
import type { TranslationKey } from "../i18n";

export default function LearnPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.howRagWorks")}
        description={t("learn.description")}
        badge={<StatusBadge label={t("learn.badge")} tone="accent" />}
      />

      <div className="rounded-xl border border-line bg-surface px-6 py-9 text-center shadow-sm sm:py-12">
        <p className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          {t("learn.hero.statement")}
        </p>
        <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-muted">
          {t("learn.hero.body")}
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
                  {t(`learn.${section.id}.title` as TranslationKey)}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`learn.${section.id}.text` as TranslationKey)}
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
          <p className="text-sm font-semibold text-ink">{t("learn.cta.title")}</p>
          <p className="mt-0.5 text-sm text-muted">{t("learn.cta.body")}</p>
        </div>
        <Link to="/playground" className={buttonStyles("primary")}>
          {t("learn.cta.action")}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
