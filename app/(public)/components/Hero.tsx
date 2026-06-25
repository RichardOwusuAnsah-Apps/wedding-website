import { Monogram } from "@/components/ui/Monogram";
import { Countdown } from "@/components/ui/Countdown";

/** Hero — monogram, tagline, names, date/location, live countdown. */
export function Hero({ targetIso }: { targetIso?: string }) {
  return (
    <section className="hero" id="top">
      <Monogram className="reveal" />
      <div
        className="eyebrow reveal"
        style={{ fontSize: ".78rem", letterSpacing: ".4em", color: "var(--color-teal)" }}
      >
        Timeless · Elegant · Effortless
      </div>
      <h1 className="reveal">
        Richie<span className="amp">&amp;</span>Shula
      </h1>
      <div className="meta reveal">
        <span>Saturday</span>
        <i />
        <span>24 October 2026</span>
        <i />
        <span>Maryland, USA</span>
      </div>
      <Countdown className="reveal" targetIso={targetIso} />
      <div className="scrollcue">Scroll ↓</div>
    </section>
  );
}
