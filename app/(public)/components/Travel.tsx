import { SectionHead } from "@/components/ui/SectionHead";
import { publicImageUrl } from "@/lib/storage";
import type { Hotel } from "@/lib/types";

/**
 * Google Maps search for a hotel. Built from the name and address rather than
 * a stored link, so every hotel is reachable without the couple pasting a url
 * for each one. Falls back to the name alone if no address was entered, and
 * returns null when there is nothing to search for — a "Getting here" note is
 * not a place.
 */
function mapsUrl(h: Hotel): string | null {
  const query = [h.name, h.address].filter(Boolean).join(", ").trim();
  if (!query || !h.address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function Travel({
  hotels,
  photoIds,
}: {
  hotels: Hotel[];
  /** Hotel ids that have a picture at gallery/hotels/<id>.webp. */
  photoIds?: Set<string>;
}) {
  return (
    <section id="travel">
      <div className="wrap">
        <SectionHead eyebrow="For our guests" title="Travel & Stay">
          Flying in? Here are our recommended hotels and the easiest way to reach
          us.
        </SectionHead>
        <div className="cards">
          {hotels.map((h) => {
            const detail = [h.address, h.notes].filter(Boolean).join(" · ");
            const isGettingHere = (h.tier ?? "").toLowerCase() === "getting here";
            const maps = mapsUrl(h);
            const photo = photoIds?.has(h.id)
              ? publicImageUrl("gallery", `hotels/${h.id}.webp`)
              : null;
            // Already stored at display size, so it is served straight from
            // storage rather than through a resize.
            const panel = photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="map-photo" src={photo} alt="" loading="lazy" />
            ) : null;
            return (
              <div className="card reveal" key={h.id}>
                {/* The map panel is the big target — a guest on a phone taps
                    the picture, not the small link underneath. */}
                {maps ? (
                  <a
                    className={`map map-link${photo ? " has-photo" : ""}`}
                    href={maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${h.name} in Google Maps`}
                  >
                    {panel}
                  </a>
                ) : (
                  <div className={`map${photo ? " has-photo" : ""}`}>{panel}</div>
                )}
                <div className="body">
                  {h.tier && <span className="role">{h.tier}</span>}
                  <h4>
                    {maps ? (
                      <a
                        className="card-title-link"
                        href={maps}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {h.name}
                      </a>
                    ) : (
                      h.name
                    )}
                  </h4>
                  {detail && <p>{detail}</p>}
                  <div className="card-links">
                    {maps && (
                      <a
                        className="link"
                        href={maps}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Directions →
                      </a>
                    )}
                    {h.booking_url && (
                      <a
                        className="link"
                        href={h.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {isGettingHere ? "Travel tips →" : "Book a room →"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
