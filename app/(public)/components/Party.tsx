import { SectionHead } from "@/components/ui/SectionHead";
import type { PartyMember } from "@/lib/types";
import { PartyTabs } from "./PartyTabs";

export function Party({ members }: { members: PartyMember[] }) {
  return (
    <section id="party">
      <div className="wrap">
        <SectionHead eyebrow="By our side" title="The Wedding Party">
          The people standing with us — our families, friends, and the ones
          who&apos;ve carried this journey with us.
        </SectionHead>
        <PartyTabs members={members} />
      </div>
    </section>
  );
}
