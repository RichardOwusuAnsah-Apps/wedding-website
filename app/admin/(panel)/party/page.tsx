import { PartyManager } from "@/components/admin/PartyManager";
import { listRows } from "@/lib/admin/data";
import type { PartyMember } from "@/lib/types";

export default async function Page() {
  const members = (await listRows("wedding_party")) as unknown as PartyMember[];
  return <PartyManager members={members} />;
}
