export default function Logo() {
  return (
    <div className="flex flex-col items-center">
      <span className="font-serif text-3xl font-semibold tracking-wide text-[var(--odyssey-text)] uppercase" style={{ letterSpacing: "0.08em" }}>
        Odyssey
      </span>
      <span className="mt-1 text-[9px] font-sans tracking-[0.2em] text-[var(--odyssey-text-muted)] uppercase">
        Stories · Journeys · Archives
      </span>
    </div>
  );
}
