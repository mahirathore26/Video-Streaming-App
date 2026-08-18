export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={[
        "rounded-[var(--odyssey-radius)] border border-[var(--odyssey-border)] bg-[var(--odyssey-surface)]",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
