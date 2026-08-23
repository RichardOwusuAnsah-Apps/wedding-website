import type { RsvpRow } from "./rsvpTypes";

/**
 * One RSVP submission is one row in the database, but a guest bringing a +1 is
 * two actual people at the wedding. The admin table and the CSV export both
 * need that expanded view — and they need to agree — so it lives here.
 */
export interface RsvpPerson {
  key: string;
  name: string;
  isPlusOne: boolean;
  /** The guest who brought them; null for the person who submitted. */
  broughtBy: string | null;
  /** The submission they belong to, for the shared fields (meal, events…). */
  rsvp: RsvpRow;
}

/** Flattens submissions into one entry per person attending. */
export function expandToPeople(rows: RsvpRow[]): RsvpPerson[] {
  return rows.flatMap((rsvp) => {
    const people: RsvpPerson[] = [
      {
        key: rsvp.id,
        name: rsvp.full_name,
        isPlusOne: false,
        broughtBy: null,
        rsvp,
      },
    ];
    const guest = rsvp.guest_name?.trim();
    if (guest) {
      people.push({
        key: `${rsvp.id}:plus-one`,
        name: guest,
        isPlusOne: true,
        broughtBy: rsvp.full_name,
        rsvp,
      });
    }
    return people;
  });
}

/**
 * Heads to cater for. Counts party_size rather than the expanded list because
 * RSVPs taken before the +1 change could record a party of 3 or 4 with no
 * names attached; those seats still need feeding.
 */
export function headCount(rows: RsvpRow[]): number {
  return rows
    .filter((r) => r.attending)
    .reduce((total, r) => total + Math.max(1, r.party_size ?? 1), 0);
}
