import { SectionHead } from "@/components/ui/SectionHead";
import type { FamilyGroup } from "@/lib/types";

const SIDE_LABEL: Record<string, string> = {
  groom: "The Groom's Family",
  bride: "The Bride's Family",
};

export function Family({ groups }: { groups: FamilyGroup[] }) {
  return (
    <section id="family">
      <div className="wrap">
        <SectionHead eyebrow="Our roots" title="Family">
          The two families uniting in joy and celebration.
        </SectionHead>
        <div className="fam-grid">
          {groups.map((g) => {
            const members = (g.members ?? "")
              .split("\n")
              .map((m) => m.trim())
              .filter(Boolean);
            return (
              <div className="fam reveal" key={g.id}>
                <div className="tag">{SIDE_LABEL[g.side] ?? g.side}</div>
                <h4>{g.surname}</h4>
                {members.length > 0 && (
                  <ul>
                    {members.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
