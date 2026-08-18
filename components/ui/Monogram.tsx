/**
 * The couple's monogram. When a custom logo has been uploaded in the admin
 * (`src`), it is shown as-is; otherwise the circular "RS" placeholder is used.
 */
export function Monogram({
  className = "",
  src,
}: {
  className?: string;
  src?: string;
}) {
  if (src) {
    return (
      <div className={`monogram monogram-custom ${className}`.trim()} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="monogram-img" />
      </div>
    );
  }
  return (
    <div className={`monogram ${className}`.trim()} aria-hidden="true">
      <span className="rs">RS</span>
    </div>
  );
}
