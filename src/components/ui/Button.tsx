import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonStyles, type ButtonVariant } from "../../lib/buttonStyles";

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={buttonStyles(variant, className)} {...rest}>
      {children}
    </button>
  );
}
