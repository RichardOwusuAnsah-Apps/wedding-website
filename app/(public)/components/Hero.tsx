import { Monogram } from "@/components/ui/Monogram";
import { Countdown } from "@/components/ui/Countdown";
import { splitCoupleNames, weddingDateParts } from "@/lib/format";

/** Hero — monogram, tagline, names, date/location, live countdown. */
export function Hero({
  coupleNames,
  tagline,
  location,
  targetIso,
}: {
  coupleNames: string;
  tagline: string;
  location: string;
  targetIso: string;
}) {
  const { first, second } = splitCoupleNames(coupleNames);
  const date = weddingDateParts(targetIso);

  return (
    <section className="hero" id="top">
      <Monogram className="reveal" />
      <div
        className="eyebrow reveal"
        style={{ fontSize: ".78rem", letterSpacing: ".4em", color: "var(--color-teal)" }}
      >
        {tagline}
      </div>
      <h1 className="reveal">
        {first}
        {second && <span className="amp">&amp;</span>}
        {second}
      </h1>
      <div className="meta reveal">
        {date && (
          <>
            <span>{date.weekday}</span>
            <i />
            <span>{date.long}</span>
            <i />
          </>
        )}
        <span>{location}</span>
      </div>
      <Countdown className="reveal" targetIso={targetIso} />
      <div className="scrollcue">Scroll ↓</div>
    </section>
  );
}
