/**
 * Which celebrations a guest is coming to. Stored in rsvps.events_attending as
 * a comma-separated list of keys in canonical order — no schema change, the
 * column was already text.
 *
 * Rows written before multi-select hold a single key, or the literal "all";
 * parse() understands both, so old RSVPs keep reading correctly everywhere.
 */
export const RSVP_EVENTS = [
  { key: "traditional", label: "Traditional" },
  { key: "wedding", label: "Wedding" },
  { key: "reception", label: "Reception" },
] as const;

export type RsvpEventKey = (typeof RSVP_EVENTS)[number]["key"];

const KEYS: RsvpEventKey[] = RSVP_EVENTS.map((e) => e.key);

/** Stored value (or raw user input) -> canonical keys, ordered and deduped. */
export function parseEvents(stored: string | null | undefined): RsvpEventKey[] {
  if (!stored) return [];
  const raw = stored
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (raw.includes("all")) return [...KEYS]; // legacy rows, and the All shortcut
  return KEYS.filter((k) => raw.includes(k));
}

/** Keys -> the value to store. Null when nothing was chosen. */
export function serializeEvents(keys: readonly string[]): string | null {
  const chosen = parseEvents(keys.join(","));
  return chosen.length > 0 ? chosen.join(",") : null;
}

/** Human-readable, for the admin table, the CSV and the notification email. */
export function eventsLabel(stored: string | null | undefined): string {
  const keys = parseEvents(stored);
  if (keys.length === 0) return "—";
  if (keys.length === KEYS.length) return "All celebrations";
  return keys
    .map((k) => RSVP_EVENTS.find((e) => e.key === k)!.label)
    .join(", ");
}

/** True when every celebration is selected — drives the All button's state. */
export function isAllEvents(keys: readonly string[]): boolean {
  return parseEvents(keys.join(",")).length === KEYS.length;
}
