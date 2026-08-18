import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  minHeight = "180px",
}) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center py-16 text-center"
      style={{ minHeight }}
      role="alert"
    >
      <AlertTriangle className="mb-4 h-6 w-6 text-[var(--odyssey-danger)]" strokeWidth={1.25} aria-hidden="true" />
      <h3 className="mb-1 text-base font-semibold text-[var(--odyssey-text)]">{title}</h3>
      {message && <p className="mb-5 max-w-sm text-sm text-[var(--odyssey-text-muted)]">{message}</p>}
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
}
