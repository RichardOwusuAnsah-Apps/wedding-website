import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { programmeBySlug, isProgrammeOpen } from "@/lib/programmes";

/**
 * What a guest sees when they open a programme before its ceremony.
 *
 * Reached only by rewrite from the proxy, so the url in the address bar is
 * still /trad-program or /wedding-program — reloading at the right time shows
 * the programme itself, and a printed qr code never needs reprinting.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // Keep the holding page out of search results; the programme url is the one
  // worth finding.
  robots: { index: false, follow: false },
};

export default async function ProgrammeSoon({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const programme = programmeBySlug(slug);
  if (!programme) notFound();

  // Belt and braces: if this ever renders after the moment has passed, say so
  // rather than tell a guest to come back to a time already gone.
  const open = isProgrammeOpen(programme);

  return (
    <section className="prog-soon">
      <div className="wrap">
        <div className="prog-soon-card">
          <div className="prog-soon-eyebrow">{programme.ceremony}</div>
          <h1>{programme.title}</h1>
          {open ? (
            <>
              <p className="prog-soon-when">It&rsquo;s ready</p>
              <p className="prog-soon-note">
                Refresh this page to open the programme.
              </p>
            </>
          ) : (
            <>
              <p className="prog-soon-lead">This programme opens on</p>
              <p className="prog-soon-when">{programme.opensLabel}</p>
              <p className="prog-soon-note">
                Eastern Time. Keep this page — it will open the programme
                itself once the ceremony begins, with nothing new to scan.
              </p>
            </>
          )}
          <Link className="prog-soon-back" href="/">
            Back to our website
          </Link>
        </div>
      </div>
    </section>
  );
}
