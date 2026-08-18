import { Inbox } from "lucide-react";

export default function EmptyState({
  message = "No data found",
  icon: Icon = Inbox,
  minHeight = "180px",
}) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center py-16 text-center"
      style={{ minHeight }}
    >
      <Icon className="mb-4 h-6 w-6 text-[var(--odyssey-text-muted)]" strokeWidth={1.25} aria-hidden="true" />
      <p className="max-w-xs text-sm text-[var(--odyssey-text-muted)]">{message}</p>
    </div>
  );
}
