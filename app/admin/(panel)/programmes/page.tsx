import { PROGRAMMES, isProgrammeOpen } from "@/lib/programmes";

/**
 * The two programme documents, openable here at any time.
 *
 * Guests are held at a "opens on ..." page until each ceremony's moment; a
 * signed-in admin is let straight through by the proxy, so these links show
 * the real document even before it is public. That is the way to proof a
 * programme before anyone else can read it.
 */

export const dynamic = "force-dynamic";

export default function Page() {
  const now = new Date();

  return (
    <div>
      <h1 className="font-display text-[1.8rem] text-burgundy mb-1">
        Programmes
      </h1>
      <p className="text-muted text-[0.95rem] mb-7 max-w-[62ch]">
        Each programme stays closed to guests until its ceremony. You can open
        them here at any time — you are signed in, so you are let straight
        through.
      </p>

      <div className="flex flex-col gap-4">
        {PROGRAMMES.map((p) => {
          const open = isProgrammeOpen(p, now);
          return (
            <div
              key={p.slug}
              className="bg-white border border-line rounded-[2px] p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-util text-[0.62rem] tracking-[0.2em] uppercase text-muted mb-1">
                    {p.ceremony}
                  </div>
                  <h2 className="font-display text-[1.3rem] text-burgundy">
                    {p.title}
                  </h2>
                </div>
                <span
                  className={`font-util text-[0.62rem] tracking-[0.16em] uppercase px-2.5 py-1 rounded-[2px] ${
                    open
                      ? "bg-teal text-white"
                      : "bg-sand text-burgundy border border-line"
                  }`}
                >
                  {open ? "Open to guests" : "Closed to guests"}
                </span>
              </div>

              <dl className="mt-4 grid gap-y-2 gap-x-5 grid-cols-[auto_1fr] text-[0.92rem]">
                <dt className="font-util text-[0.62rem] tracking-[0.16em] uppercase text-muted pt-1">
                  Opens
                </dt>
                <dd>{p.opensLabel} &middot; Eastern Time</dd>
                <dt className="font-util text-[0.62rem] tracking-[0.16em] uppercase text-muted pt-1">
                  Link
                </dt>
                <dd className="break-all">/{p.slug}</dd>
              </dl>

              <a
                href={`/${p.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 font-util text-[0.68rem] tracking-[0.16em] uppercase border border-line rounded-[2px] px-3 py-2 text-burgundy hover:bg-sand transition"
              >
                Open programme &#8599;
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
