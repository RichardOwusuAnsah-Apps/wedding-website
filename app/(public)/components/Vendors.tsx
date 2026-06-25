import { SectionHead } from "@/components/ui/SectionHead";
import type { Vendor } from "@/lib/types";

export function Vendors({ vendors }: { vendors: Vendor[] }) {
  if (vendors.length === 0) return null;
  return (
    <section id="vendors">
      <div className="wrap">
        <SectionHead eyebrow="The dream team" title="Our Vendors">
          The talented people bringing our day to life. We highly recommend them.
        </SectionHead>
        <div className="vend">
          {vendors.map((v) => {
            const inner = (
              <>
                <span>{v.category}</span>
                <h4>{v.name}</h4>
              </>
            );
            return v.url ? (
              <a
                className="vcard reveal"
                key={v.id}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            ) : (
              <div className="vcard reveal" key={v.id}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
