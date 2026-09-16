import { useEffect } from "react";
import { X } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { LogoMark } from "./Logo";
import { NavList } from "./NavList";

export function MobileNav({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={t("nav.mainLabel")}
    >
      <button
        type="button"
        aria-label={t("common.closeNav")}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <span className="flex items-center gap-2.5">
            <LogoMark size={26} />
            <span className="text-sm font-semibold tracking-tight">
              RAG <span className="text-accent">Inspector</span>
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.closeNav")}
            autoFocus
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          <NavList onNavigate={onClose} />
        </div>
        <div className="flex items-center gap-2 border-t border-line px-4 py-3">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {t("overview.badgeLocal")}
          </span>
        </div>
      </div>
    </div>
  );
}
