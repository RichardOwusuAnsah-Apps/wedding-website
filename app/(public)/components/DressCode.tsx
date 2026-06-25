import { SectionHead } from "@/components/ui/SectionHead";

// Static design content — the two-ceremony palettes from the mockup.
const PALETTES = [
  {
    title: "Traditional Ceremony",
    sub: "Traditional / Kente attire",
    swatches: [
      { color: "#D7792F", name: "Orange" },
      { color: "#FCFAF5", name: "White" },
      { color: "#3F7A47", name: "Green" },
      { color: "#C49A48", name: "Gold" },
    ],
  },
  {
    title: "The White Wedding",
    sub: "Formal attire",
    swatches: [
      { color: "#C49A48", name: "Gold" },
      { color: "#FCFAF5", name: "White" },
      { color: "#B2C2A6", name: "Light Sage" },
    ],
  },
];

export function DressCode() {
  return (
    <section className="palette" id="dress">
      <div className="wrap">
        <SectionHead eyebrow="Dress to celebrate" title="Colours & Dress Code">
          Two celebrations, two palettes. We&apos;d love our guests to dress with
          us — here are the colours for each day.
        </SectionHead>
        <div className="dress-cols reveal">
          {PALETTES.map((p) => (
            <div className="dress-col" key={p.title}>
              <h3>{p.title}</h3>
              <span className="dc-sub">{p.sub}</span>
              <div className="swatches">
                {p.swatches.map((s) => (
                  <div className="sw" key={s.name}>
                    <div className="chip" style={{ background: s.color }} />
                    <small>{s.name}</small>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
