import { Monogram } from "@/components/ui/Monogram";
import { Countdown } from "@/components/ui/Countdown";
import { HeroPhotos } from "./HeroPhotos";
import { splitCoupleNames } from "@/lib/format";
import type { Photo } from "@/lib/types";

// The wedding day. Drives the hero countdown even when the admin date field is
// left blank (blank keeps the date text off the hero — the countdown stays).
const WEDDING_ISO = "2026-10-23T11:00:00"; // 23 October 2026, 11:00am

/** Hero — monogram, tagline, names, location, live countdown (no date text). */
export function Hero({
  coupleNames,
  tagline,
  location,
  targetIso,
  monogramSrc,
  featured = [],
}: {
  coupleNames: string;
  tagline: string;
  location: string;
  targetIso: string;
  monogramSrc?: string;
  featured?: Photo[];
}) {
  const { first, second } = splitCoupleNames(coupleNames);
  const countdownTarget = targetIso || WEDDING_ISO;

  return (
    <section className="hero" id="top">
      <HeroPhotos photos={featured} />
      <Monogram className="reveal" src={monogramSrc} />
      {tagline && (
        <div
          className="eyebrow reveal"
          style={{ fontSize: ".78rem", letterSpacing: ".4em", color: "var(--color-teal)" }}
        >
          {tagline}
        </div>
      )}
      <h1 className="reveal">
        {first}
        {second && <span className="amp">&amp;</span>}
        {second}
      </h1>
      {location && (
        <div className="meta reveal">
          <span>{location}</span>
        </div>
      )}
      <Countdown className="reveal" targetIso={countdownTarget} />
    </section>
  );
}
