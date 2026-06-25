import { createClient } from "@/lib/supabase/server";
import { GuestbookManager } from "@/components/admin/GuestbookManager";
import type { GuestbookEntry } from "@/lib/types";

export default async function GuestbookPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("guestbook")
    .select("*")
    .order("created_at", { ascending: false });
  const entries = (data ?? []) as GuestbookEntry[];
  return <GuestbookManager entries={entries} />;
}
