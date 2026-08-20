"use client";

import { useState } from "react";
import type { PartyMember } from "@/lib/types";
import { initials, publicImageUrl } from "@/lib/storage";
import { FramedPhoto } from "@/components/site/FramedPhoto";

type Group = { key: string; title: string };

const SIDES: { key: "groom" | "bride"; label: string; groups: Group[] }[] = [
  {
    key: "groom",
    label: "The Groom's Side",
    groups: [
      { key: "best_man", title: "Best Man" },
      { key: "groomsmen", title: "Groomsmen" },
      { key: "trad_men", title: "Extended Groomsmen" },
    ],
  },
  {
    key: "bride",
    label: "The Bride's Side",
    groups: [
      { key: "maid_of_honour", title: "Maids of Honour" },
      { key: "bridesmaids", title: "Bridesmaids" },
      { key: "trad_ladies", title: "Extended Bridesmaids" },
    ],
  },
];

// Hide unfilled placeholder rows (e.g. "[Name TBA]") from the public site.
function isReal(member: PartyMember): boolean {
  const n = (member.name ?? "").trim();
  return n.length > 0 && !n.startsWith("[");
}

function Person({ member }: { member: PartyMember }) {
  return (
    <div className="person">
      <div className="portrait">
        {member.photo_path ? (
          <FramedPhoto
            src={publicImageUrl("party-photos", member.photo_path)}
            alt={member.name}
            crop={member}
            sizePx={640}
          />
        ) : (
          initials(member.name)
        )}
      </div>
      <p>{member.name}</p>
    </div>
  );
}

export function PartyTabs({ members }: { members: PartyMember[] }) {
  const [side, setSide] = useState<"groom" | "bride">("groom");
  const active = SIDES.find((s) => s.key === side)!;

  return (
    <>
      <div className="party-tabs reveal">
        {SIDES.map((s) => (
          <button
            key={s.key}
            className={`ptab${s.key === side ? " active" : ""}`}
            onClick={() => setSide(s.key)}
            aria-pressed={s.key === side}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="party-group" key={side}>
        {active.groups.map((g, gi) => {
          const people = members
            .filter((m) => m.side === side && m.group_key === g.key && isReal(m))
            .sort((a, b) => a.sort_order - b.sort_order);
          if (people.length === 0) return null;
          return (
            <div key={g.key} style={gi > 0 ? { marginTop: 48 } : undefined}>
              <h3>{g.title}</h3>
              <div
                className="people"
                style={gi === 0 ? { marginBottom: 48 } : undefined}
              >
                {people.map((m) => (
                  <Person key={m.id} member={m} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
