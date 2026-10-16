/**
 * The two programme documents and when each one opens to guests.
 *
 * Both live as static files under `public/`, reached through the clean urls in
 * next.config.ts. Until a programme's moment arrives the proxy sends guests to
 * a holding page instead; a signed-in admin always gets through, so the
 * programme can be checked before anyone else sees it.
 *
 * The urls are printed on qr codes, so the slugs are permanent. Swapping the
 * document behind one (the white wedding is a placeholder pdf for now) means
 * changing only the rewrite destination in next.config.ts.
 */

export type Programme = {
  /** Path segment, and the url the qr code points at: /<slug>. */
  readonly slug: string;
  /** How the link reads on the celebration card. */
  readonly linkLabel: string;
  /** Title of the holding page. */
  readonly title: string;
  /** Which celebration it belongs to, for the admin list. */
  readonly ceremony: string;
  /** The instant it opens. Eastern time — the couple's clock, and the venue's. */
  readonly opensAt: string;
  /** The same moment written out, so guests never see a raw timestamp. */
  readonly opensLabel: string;
  /** Every static path that serves this document, all gated together. */
  readonly files: readonly string[];
};

export const PROGRAMMES: readonly Programme[] = [
  {
    slug: "trad-program",
    linkLabel: "Traditional Marriage Program",
    title: "Traditional Marriage Program",
    ceremony: "Traditional Ceremony",
    opensAt: "2026-10-23T10:50:00-04:00",
    opensLabel: "Friday 23 October at 10:50 AM",
    files: ["/trad-program/index.html"],
  },
  {
    slug: "wedding-program",
    linkLabel: "Wedding Program",
    title: "Wedding Program",
    ceremony: "White Wedding",
    opensAt: "2026-10-24T12:50:00-04:00",
    opensLabel: "Saturday 24 October at 12:50 PM",
    // The pdf placeholder and the html that will replace it, so the gate keeps
    // working across the swap without a second change here.
    files: ["/wedding-program/program.pdf", "/wedding-program/index.html"],
  },
];

export function programmeBySlug(slug: string): Programme | undefined {
  return PROGRAMMES.find((p) => p.slug === slug);
}

/** True once the programme's moment has passed. */
export function isProgrammeOpen(p: Programme, now: Date = new Date()): boolean {
  return now.getTime() >= new Date(p.opensAt).getTime();
}

/**
 * The programme a celebration card links to, matched on its title.
 *
 * Matched on "white" rather than "wedding" on purpose: the reception is titled
 * "Wedding Reception" and must not pick up the white wedding's programme.
 */
export function programmeForEvent(title: string | null): Programme | undefined {
  const t = (title ?? "").toLowerCase();
  if (t.includes("traditional")) return programmeBySlug("trad-program");
  if (t.includes("white")) return programmeBySlug("wedding-program");
  return undefined;
}

/** Clean url and underlying file paths, i.e. everything the gate must cover. */
export function gatedPaths(p: Programme): string[] {
  return [`/${p.slug}`, ...p.files];
}
