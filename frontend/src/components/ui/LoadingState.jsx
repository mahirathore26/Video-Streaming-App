export default function LoadingState({ message = "Loading...", minHeight = "180px" }) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center py-16 text-center"
      style={{ minHeight }}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div
        className="mb-5 h-8 w-8 animate-spin rounded-full border-2 border-[var(--odyssey-border-subtle)]"
        style={{ borderTopColor: "var(--odyssey-accent)" }}
        aria-hidden="true"
      />
      <p className="text-sm text-[var(--odyssey-text-muted)]">{message}</p>
    </div>
  );
}
