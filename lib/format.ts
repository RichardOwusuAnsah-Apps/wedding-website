/** Display helpers derived from settings (couple_names, wedding_date). */

export interface WeddingDateParts {
  weekday: string; // "Saturday"
  long: string; // "24 October 2026"
  compact: string; // "24 · 10 · 2026"
}

export function weddingDateParts(iso: string): WeddingDateParts | null {
  const datePart = (iso || "").split("T")[0];
  const d = new Date(`${datePart}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const weekday = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    timeZone: "UTC",
  }).format(d);
  const long = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
  const [y, m, day] = datePart.split("-");
  const compact = `${Number(day)} · ${Number(m)} · ${y}`;
  return { weekday, long, compact };
}

/** Split "Richie & Shula" into the two names for the styled ampersand. */
export function splitCoupleNames(value: string): { first: string; second: string } {
  const parts = (value || "").split(/\s*&\s*/);
  return { first: parts[0] ?? value ?? "", second: parts[1] ?? "" };
}
