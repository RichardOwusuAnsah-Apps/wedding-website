/**
 * The two program documents and when each one opens to guests.
 *
 * Both live as static files under `public/`, reached through the clean urls in
 * next.config.ts. Until a program's moment arrives the proxy sends guests to
 * a holding page instead; a signed-in admin always gets through, so the
 * program can be checked before anyone else sees it.
 *
 * The urls are printed on qr codes, so the slugs are permanent. Swapping the
 * document behind one (the white wedding is a placeholder pdf for now) means
 * changing only the rewrite destination in next.config.ts.
 */

export type Program = {
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

export const PROGRAMS: readonly Program[] = [
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
    files: ["/wedding-program/index.html"],
  },
  {
    slug: "reception-program-and-menu",
    linkLabel: "Reception Program & Menu",
    title: "Reception Program & Menu",
    ceremony: "Wedding Reception",
    opensAt: "2026-10-24T15:50:00-04:00",
    opensLabel: "Saturday 24 October at 3:50 PM",
    files: ["/reception-program-and-menu/index.html"],
  },
];

export function programBySlug(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}

/** True once the program's moment has passed. */
export function isProgramOpen(p: Program, now: Date = new Date()): boolean {
  return now.getTime() >= new Date(p.opensAt).getTime();
}

/**
 * The program a celebration card links to, matched on its title.
 *
 * Matched on "white" rather than "wedding" on purpose: the reception is titled
 * "Wedding Reception" and must not pick up the white wedding's program.
 */
export function programForEvent(title: string | null): Program | undefined {
  const t = (title ?? "").toLowerCase();
  if (t.includes("traditional")) return programBySlug("trad-program");
  if (t.includes("white")) return programBySlug("wedding-program");
  if (t.includes("reception")) return programBySlug("reception-program-and-menu");
  return undefined;
}

/** Clean url and underlying file paths, i.e. everything the gate must cover. */
export function gatedPaths(p: Program): string[] {
  return [`/${p.slug}`, ...p.files];
}
