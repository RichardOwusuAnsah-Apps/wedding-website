"use client";

import { useState } from "react";
import Image from "next/image";
import type { PartyMember } from "@/lib/types";
import { initials, publicImageUrl } from "@/lib/storage";
import { focalStyle } from "@/lib/image";

type Group = { key: string; title: string; sub: string };

const SIDES: { key: "groom" | "bride"; label: string; groups: Group[] }[] = [
  {
    key: "groom",
    label: "The Groom's Side",
    groups: [
      { key: "best_man", title: "Best Man", sub: "By the groom's side" },
      { key: "groomsmen", title: "Groomsmen", sub: "Standing with the groom" },
      { key: "trad_men", title: "Traditional Wedding Men", sub: "Richie's customary procession" },
    ],
  },
  {
    key: "bride",
    label: "The Bride's Side",
    groups: [
      { key: "maid_of_honour", title: "Maids of Honour", sub: "By the bride's side" },
      { key: "bridesmaids", title: "Bridesmaids", sub: "Standing with the bride" },
      { key: "trad_ladies", title: "Traditional Wedding Ladies", sub: "Shula's customary procession" },
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
          <Image
            src={publicImageUrl("party-photos", member.photo_path)}
            alt={member.name}
            fill
            sizes="(max-width: 900px) 50vw, 25vw"
            style={focalStyle(member)}
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
              <div className="gsub">{g.sub}</div>
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
