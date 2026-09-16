import { LoaderCircle } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useI18n } from "../../hooks/useI18n";
import { Button } from "../ui/Button";

export function QueryInput({
  value,
  onChange,
  onSubmit,
  busy = false,
  placeholderText,
  submitLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy?: boolean;
  placeholderText?: string;
  submitLabel?: string;
}) {
  const { t } = useI18n();
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!busy && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="rounded-xl border border-line bg-surface p-3 shadow-sm transition-colors focus-within:border-accent/50 sm:p-4"
    >
      <label htmlFor="rag-query" className="sr-only">
        {placeholderText ?? t("playground.placeholder")}
      </label>
      <textarea
        id="rag-query"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        spellCheck={false}
        placeholder={placeholderText ?? t("playground.placeholder")}
        className="w-full resize-none bg-transparent text-base leading-relaxed text-ink placeholder:text-faint focus:outline-none sm:text-lg"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="hidden font-mono text-[11px] text-faint sm:block">
          {t("playground.hint")}
        </p>
        <Button
          type="submit"
          disabled={busy || !value.trim()}
          className="w-full sm:w-auto"
        >
          {busy ? (
            <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
          ) : null}
          {busy ? t("playground.running") : (submitLabel ?? t("playground.ask"))}
          {!busy && (
            <kbd
              aria-hidden="true"
              className="rounded border border-white/30 px-1.5 font-mono text-[10px] leading-4"
            >
              ↵
            </kbd>
          )}
        </Button>
      </div>
    </form>
  );
}
