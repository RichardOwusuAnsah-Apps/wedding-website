/** Public URL for an object in a public Supabase Storage bucket. */
export function publicImageUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Route a public image URL through Next's image optimizer so a resized
 * WebP/AVIF version is served (and edge-cached) instead of the multi-megabyte
 * Supabase original. `width` must be one of Next's allowed sizes; pick the one
 * closest to how big the image is actually shown.
 *
 * Allowed widths: 16,32,48,64,96,128,256,384,640,750,828,1080,1200,1920,2048,3840.
 * Quality must be 75 (Next's default and only allowed value unless configured).
 */
export function optimizedImageUrl(src: string, width: number, quality = 75): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
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
