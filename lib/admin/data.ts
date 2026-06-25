import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Generic ordered fetch for an admin resource table (server components only). */
export async function listRows(
  table: string,
  orderBy = "sort_order",
): Promise<Record<string, unknown>[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(orderBy, { ascending: true });
  if (error) {
    console.error(`[admin] list ${table}:`, error.message);
    return [];
  }
  return (data ?? []) as Record<string, unknown>[];
}
