import { SectionHead } from "@/components/ui/SectionHead";
import type { Hotel } from "@/lib/types";

export function Travel({ hotels }: { hotels: Hotel[] }) {
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
            return (
              <div className="card reveal" key={h.id}>
                <div className="map" />
                <div className="body">
                  {h.tier && <span className="role">{h.tier}</span>}
                  <h4>{h.name}</h4>
                  {detail && <p>{detail}</p>}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
