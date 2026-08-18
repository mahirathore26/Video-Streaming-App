export default function Button({
  children,
  className = "",
  type = "button",
  variant = "primary",
  size = "md",
  iconOnly = false,
  isLoading = false,
  disabled = false,
  ...props
}) {
  const base = [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap leading-snug",
    "font-sans font-medium select-none transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--odyssey-bg)] focus-visible:ring-[var(--odyssey-accent-glow)]",
    "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-40",
  ].join(" ");

  const variants = {
    primary: [
      "bg-[var(--odyssey-accent)] text-[#F4F0E6]",
      "hover:bg-[var(--odyssey-accent-hover)] active:bg-[var(--odyssey-accent-active)] border border-transparent shadow-xs",
    ].join(" "),
    secondary: [
      "border border-[var(--odyssey-border)] bg-[var(--odyssey-surface)] text-[var(--odyssey-text)]",
      "hover:border-[var(--odyssey-border-strong)] hover:bg-[var(--odyssey-surface-hover)]",
    ].join(" "),
    ghost: [
      "bg-transparent text-[var(--odyssey-text-muted)] border border-transparent",
      "hover:text-[var(--odyssey-text)] hover:bg-[var(--odyssey-surface-soft)]",
    ].join(" "),
    destructive: [
      "border border-transparent bg-transparent text-[var(--odyssey-danger)]",
      "hover:bg-[var(--odyssey-danger-bg)] active:bg-[var(--odyssey-danger-bg)]",
    ].join(" "),
  };

  const sizes = {
    sm: iconOnly
      ? "h-8 w-8 rounded-sm text-xs p-0"
      : "min-h-[2rem] rounded-sm px-4 py-1.5 text-[10px] sm:text-[11px] tracking-[0.06em] uppercase font-sans",
    md: iconOnly
      ? "h-9 w-9 rounded-sm text-sm p-0"
      : "min-h-[2.25rem] rounded-sm px-5 py-2 text-[11px] sm:text-xs tracking-[0.08em] uppercase font-sans",
    lg: iconOnly
      ? "h-10 w-10 rounded-sm text-sm p-0"
      : "min-h-[2.5rem] rounded-sm px-6 py-2.5 text-xs sm:text-[13px] tracking-[0.08em] uppercase font-sans",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="h-3.5 w-3.5 shrink-0 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
