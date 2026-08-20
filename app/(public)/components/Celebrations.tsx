import { SectionHead } from "@/components/ui/SectionHead";
import { FramedPhoto } from "@/components/site/FramedPhoto";
import { publicImageUrl } from "@/lib/storage";
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

function colorClass(side: string | null): string {
  if (side === "teal") return "white";
  if (side === "gold") return "gold";
  if (side === "olive") return "olive";
  if (side === "sage") return "sage";
  if (side === "champagne") return "champagne";
  return "trad";
}

export function Celebrations({ events }: { events: EventRow[] }) {
  return (
    <section id="celebrations">
      <div className="wrap">
        <SectionHead eyebrow="Our celebrations" title="The Celebrations">
          We honour both our heritage and our faith — join us across each part of
          our celebration.
        </SectionHead>
        <div className="cele-grid">
          {events.map((e) => {
            const hasPhoto = Boolean(e.photo_path);
            return (
              <div className={`cele ${colorClass(e.side_color)} reveal`} key={e.id}>
                {hasPhoto ? (
                  <div className="cele-photo">
                    <FramedPhoto
                      src={publicImageUrl("gallery", e.photo_path!)}
                      alt={e.title}
                      crop={e}
                      sizePx={384}
                    />
                  </div>
                ) : (
                  <div className="ornament" />
                )}

                <div className={`cele-head${hasPhoto ? " has-photo" : ""}`}>
                  {e.day_label && <div className="tag">{e.day_label}</div>}
                  <h3>{e.title}</h3>
                  {e.description && <p className="cele-desc">{e.description}</p>}
                </div>

                <div className="det">
                  <DetailRow label="Date" value={e.event_date} />
                  <DetailRow label="Time" value={e.event_time} />
                  {e.venue_name && (
                    <div>
                      <b>Venue</b>
                      {e.map_url ? (
                        <a
                          className="cele-venue"
                          href={e.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {e.venue_name} <span aria-hidden>→</span>
                        </a>
                      ) : (
                        <span>{e.venue_name}</span>
                      )}
                    </div>
                  )}
                  <DetailRow label="Dress Code" value={e.attire} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
