/**
 * Circular RS monogram. Placeholder uses the Tangerine script "RS" exactly as
 * the mockup; swap in the real exported rs-logo.svg (Section 9 asset) later
 * without touching call sites.
 */
export function Monogram({ className = "" }: { className?: string }) {
  return (
    <div className={`monogram ${className}`.trim()} aria-hidden="true">
      <span className="rs">RS</span>
    </div>
  );
}
