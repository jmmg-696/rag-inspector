import { useState } from "react";
import { Menu } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { LanguageSelect } from "./LanguageSelect";
import { LogoMark } from "./Logo";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("nav.mainLabel")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-ink"
        >
          <Menu size={18} />
        </button>
        <LogoMark size={22} />
        <span className="text-sm font-semibold tracking-tight">
          RAG <span className="text-accent">Inspector</span>
        </span>
      </div>
      <div className="flex items-center gap-1">
        <LanguageSelect />
        <ThemeToggle />
      </div>
      {open && <MobileNav onClose={() => setOpen(false)} />}
    </header>
  );
}
