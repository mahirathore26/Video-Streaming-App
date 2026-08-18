export default function Input({
  className = "",
  error = false,
  disabled = false,
  ...props
}) {
  const borderStyle = error
    ? "border-[var(--odyssey-danger)] focus:border-[var(--odyssey-danger)] focus:shadow-[0_0_0_2px_var(--odyssey-danger-bg)]"
    : "border-[var(--odyssey-border)] hover:border-[var(--odyssey-border-strong)] focus:border-[var(--odyssey-accent)] focus:shadow-[0_0_0_2px_var(--odyssey-accent-glow)]";

  return (
    <input
      disabled={disabled}
      className={[
        "h-10 w-full rounded-[var(--odyssey-radius)] border bg-[var(--odyssey-surface)] px-3 text-sm text-[var(--odyssey-text)] placeholder:text-[var(--odyssey-text-muted)]",
        "outline-none transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50",
        borderStyle,
        className,
      ].join(" ")}
      {...props}
    />
  );
}
