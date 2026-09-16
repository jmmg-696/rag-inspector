import { useState } from "react";
import { Menu } from "lucide-react";
import { LogoMark } from "./Logo";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-ink"
        >
          <Menu size={18} />
        </button>
        <LogoMark size={22} />
        <span className="text-sm font-semibold tracking-tight">
          RAG <span className="text-accent">Inspector</span>
        </span>
      </div>
      <ThemeToggle />
      {open && <MobileNav onClose={() => setOpen(false)} />}
    </header>
  );
}
