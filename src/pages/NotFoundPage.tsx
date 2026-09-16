import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { buttonStyles } from "../lib/buttonStyles";
import { useI18n } from "../hooks/useI18n";

export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <EmptyState
      icon={Compass}
      title={t("notFound.title")}
      description={t("notFound.body")}
      action={
        <Link
          to="/"
          className={buttonStyles(
            "primary",
            "!bg-accent hover:!bg-accent-strong"
          )}
        >
          {t("notFound.back")}
        </Link>
      }
    />
  );
}
