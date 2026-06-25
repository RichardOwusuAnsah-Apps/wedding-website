import { SectionHead } from "@/components/ui/SectionHead";
import type { EventRow } from "@/lib/types";

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <b>{label}</b>
      <span>{value}</span>
    </div>
  );
}

export function Celebrations({ events }: { events: EventRow[] }) {
  return (
    <section id="celebrations">
      <div className="wrap">
        <SectionHead eyebrow="Two ceremonies, one love" title="The Celebrations">
          We honour both our heritage and our faith — a traditional engagement
          followed by our white wedding.
        </SectionHead>
        <div className="cele-grid">
          {events.map((e) => (
            <div
              className={`cele ${e.side_color === "teal" ? "white" : "trad"} reveal`}
              key={e.id}
            >
              <div className="ornament" />
              {e.day_label && <div className="tag">{e.day_label}</div>}
              <h3>{e.title}</h3>
              {e.description && <p style={{ opacity: 0.9 }}>{e.description}</p>}
              <div className="det">
                <DetailRow label="Date" value={e.event_date} />
                <DetailRow label="Time" value={e.event_time} />
                <DetailRow label="Venue" value={e.venue_name} />
                <DetailRow label="Attire" value={e.attire} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
