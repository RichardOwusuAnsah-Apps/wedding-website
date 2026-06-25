import { SectionHead } from "@/components/ui/SectionHead";
import type { Venue } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  engagement: "Traditional Engagement",
  ceremony: "Ceremony",
  reception: "Reception",
};

export function Venues({ venues }: { venues: Venue[] }) {
  return (
    <section id="venues">
      <div className="wrap">
        <SectionHead eyebrow="Where to find us" title="Venues">
          Everything you need to be in the right place at the right time.
        </SectionHead>
        <div className="cards">
          {venues.map((v) => {
            const detail = [v.address, v.time_note, v.notes]
              .filter(Boolean)
              .join(" · ");
            return (
              <div className="card reveal" key={v.id}>
                <div className="map" />
                <div className="body">
                  <span className="role">
                    {v.kind ? (KIND_LABEL[v.kind] ?? v.kind) : "Venue"}
                  </span>
                  <h4>{v.name}</h4>
                  {detail && <p>{detail}</p>}
                  {v.map_url && (
                    <a
                      className="link"
                      href={v.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get directions →
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
