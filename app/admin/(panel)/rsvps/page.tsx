import { createClient } from "@/lib/supabase/server";
import { ExportCsv } from "@/components/admin/ExportCsv";
import type { RsvpRow } from "@/lib/admin/rsvpTypes";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
}

export default async function RsvpsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rsvps")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as RsvpRow[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl text-burgundy">
          RSVPs{" "}
          <span className="font-util text-base text-muted align-middle">
            ({rows.length})
          </span>
        </h1>
        <ExportCsv rows={rows} />
      </div>

      {rows.length === 0 ? (
        <p className="text-muted">No RSVPs yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-line rounded-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="font-util text-[0.6rem] tracking-[0.14em] uppercase text-muted">
                {["Name", "Email", "Attending", "Events", "Guests", "Meal", "Message", "Date"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 border-b border-line whitespace-nowrap">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="text-[0.92rem]">
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0 align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-burgundy">{r.full_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{r.email ?? "—"}</td>
                  <td className="px-4 py-3">{r.attending ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 capitalize">{r.events_attending ?? "—"}</td>
                  <td className="px-4 py-3">{r.party_size ?? 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.meal_preference ?? "—"}</td>
                  <td className="px-4 py-3 max-w-xs text-muted">{r.message ?? ""}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{fmtDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
