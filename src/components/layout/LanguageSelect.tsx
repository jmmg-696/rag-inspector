import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { languages } from "../../i18n";
import { useI18n } from "../../hooks/useI18n";
import { cn } from "../../lib/cn";

export function LanguageSelect({ className }: { className?: string }) {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.language")}
        className="inline-flex h-8 items-center gap-1 rounded-md px-2 font-mono text-xs uppercase text-muted transition-colors hover:bg-elevated hover:text-ink"
      >
        {language}
        <ChevronDown size={12} aria-hidden="true" />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("common.language")}
          className="absolute bottom-full right-0 z-50 mb-1 w-36 animate-fade-up rounded-lg border border-line bg-surface p-1 shadow-lg"
        >
          {languages.map((option) => (
            <li key={option.value} role="none">
              <button
                type="button"
                role="option"
                aria-selected={option.value === language}
                onClick={() => {
                  setLanguage(option.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-elevated hover:text-ink"
              >
                {option.label}
                {option.value === language && (
                  <Check size={13} aria-hidden="true" className="text-accent" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
