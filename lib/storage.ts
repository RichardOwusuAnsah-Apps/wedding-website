/** Public URL for an object in a public Supabase Storage bucket. */
export function publicImageUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

/** Initials fallback for a missing portrait (e.g. "Kwame Boateng" -> "KB"). */
export function initials(name: string): string {
  return name
    .replace(/[[\]]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
