export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
  ...props
}) {
  const resolvedVariant =
    variant === "public" ? "success" :
    variant === "private" ? "warning" :
    variant === "draft" || variant === "status" ? "neutral" :
    variant;

  const dotColors = {
    success: "bg-[var(--odyssey-success)]",
    warning: "bg-[var(--odyssey-warning)]",
    danger: "bg-[var(--odyssey-danger)]",
    neutral: "bg-[var(--odyssey-text-muted)]",
    accent: "bg-[var(--odyssey-accent)]",
  };

  const textColors = {
    success: "text-[var(--odyssey-success)]",
    warning: "text-[var(--odyssey-warning)]",
    danger: "text-[var(--odyssey-danger)]",
    neutral: "text-[var(--odyssey-text-muted)]",
    accent: "text-[var(--odyssey-accent)]",
  };

  const sizes = {
    sm: "text-[10px]",
    md: "text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium select-none ${textColors[resolvedVariant] ?? textColors.neutral} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[resolvedVariant] ?? dotColors.neutral}`} />
      {children}
    </span>
  );
}
