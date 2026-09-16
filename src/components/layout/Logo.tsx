export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        width="64"
        height="64"
        rx="14"
        className="fill-elevated stroke-line"
        strokeWidth="2"
      />
      <path
        d="M32 18v28"
        className="stroke-line-strong"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="16" r="6.5" className="fill-accent" />
      <circle cx="32" cy="32" r="6.5" className="fill-ink" />
      <circle cx="32" cy="48" r="6.5" className="fill-accent" />
    </svg>
  );
}
