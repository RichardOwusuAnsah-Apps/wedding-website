"use client";

import { useEffect, useState } from "react";

const LINKS: [href: string, label: string][] = [
  ["#story", "Our Story"],
  ["#celebrations", "Celebrations"],
  ["#party", "Wedding Party"],
  ["#gallery", "Gallery"],
  ["#travel", "Travel"],
  ["#registry", "Registry"],
  ["#guestbook", "Guestbook"],
  ["#faq", "FAQ"],
];

/** Sticky top nav: transparent at top, frosted once scrolled; mobile dropdown. */
export function SiteNav({
  monogramSrc,
  hiddenHrefs = [],
}: {
  monogramSrc?: string;
  hiddenHrefs?: string[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const links = LINKS.filter(([href]) => !hiddenHrefs.includes(href));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`site-nav${scrolled ? " scrolled" : ""}`}>
        <a href="#top" className="brand" aria-label="Home">
          {monogramSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={monogramSrc} alt="" className="brand-logo" />
          ) : (
            <>
              R <b>&amp;</b> S
            </>
          )}
        </a>
        <nav className="nav-links" aria-label="Primary">
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a href="#rsvp" className="nav-rsvp">
          RSVP
        </a>
        <button
          className="burger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {open && (
        <div className="nav-mobile">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <a href="#rsvp" onClick={() => setOpen(false)}>
            RSVP
          </a>
        </div>
      )}
    </>
  );
}
