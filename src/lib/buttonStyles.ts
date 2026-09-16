import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent font-medium text-white shadow-sm hover:bg-accent-strong dark:text-[#0b0d10]",
  secondary:
    "border border-line bg-surface text-ink hover:bg-elevated dark:border-line-strong",
  ghost: "text-muted hover:bg-elevated hover:text-ink",
};

export function buttonStyles(
  variant: ButtonVariant = "primary",
  className?: string
) {
  return cn(
    "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md px-3.5 text-sm transition-colors disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    className
  );
}
