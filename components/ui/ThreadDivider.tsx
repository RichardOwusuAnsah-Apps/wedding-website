/** Woven gold thread divider — the signature band between sections. */
export function ThreadDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`thread ${className}`.trim()} aria-hidden="true">
      <span />
    </div>
  );
}
