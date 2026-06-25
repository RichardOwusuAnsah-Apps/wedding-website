import { SectionHead } from "@/components/ui/SectionHead";
import type { RegistryItem } from "@/lib/types";

export function Registry({
  items,
  note,
}: {
  items: RegistryItem[];
  note?: string;
}) {
  return (
    <section id="registry">
      <div className="wrap">
        <SectionHead eyebrow="Your presence is the gift" title="Registry & Gifts">
          {note ||
            "Your love and prayers mean the world. For those who've asked, here are a few ways to bless us."}
        </SectionHead>
        <div className="reg-grid">
          {items.map((item) => (
            <div className="reg reveal" key={item.id}>
              {item.icon && <div className="ic">{item.icon}</div>}
              <h4>{item.title}</h4>
              {item.description && <p>{item.description}</p>}
              {item.url && (
                <a
                  className="link"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View details →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
