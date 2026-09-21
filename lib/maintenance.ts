/**
 * Temporary maintenance notice.
 *
 * Supabase is rate-restricted (free-plan cached-egress quota) until the billing
 * period rolls over on 24 September 2026, so every database-backed section —
 * celebrations, wedding party, gallery, RSVP — comes back empty. Rather than
 * show a page of bare headings, the site explains itself and hides the sections
 * that have no content.
 *
 * This whole file is disposable. Once storage is shrunk and the quota is safe,
 * delete it and the four call sites that import it (layout, page, Rsvp, CSS).
 *
 * The notice switches itself off at MAINTENANCE_UNTIL, so a stale "back on the
 * 25th" can never be left sitting on the site.
 */

/** Eastern time — the wedding is in Maryland, so that is the couple's clock. */
export const MAINTENANCE_UNTIL = "2026-09-25T00:00:00-04:00";

/** How the return date is written wherever it appears on the site. */
export const MAINTENANCE_BACK_ON = "Friday 25 September";

/** True while the notice should show. Flip to `false` to take it down early. */
export function isMaintenance(now: Date = new Date()): boolean {
  return now.getTime() < new Date(MAINTENANCE_UNTIL).getTime();
}
