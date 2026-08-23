import { createClient } from "@/lib/supabase/server";
import { ExportCsv } from "@/components/admin/ExportCsv";
import type { RsvpRow } from "@/lib/admin/rsvpTypes";
import { expandToPeople, headCount } from "@/lib/admin/rsvpPeople";
import { DeleteRsvp } from "@/components/admin/DeleteRsvp";

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
  const people = expandToPeople(rows);
  const guests = headCount(rows);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl text-burgundy">
          RSVPs{" "}
          <span className="font-util text-base text-muted align-middle">
            ({rows.length} submitted · {guests} coming)
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
                {["Name", "Email", "Attending", "Events", "Guests", "Meal", "Message", "Date", ""].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 border-b border-line whitespace-nowrap">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="text-[0.92rem]">
              {people.map((p) => {
                const r = p.rsvp;
                return (
                  <tr
                    key={p.key}
                    className={`align-top ${p.isPlusOne ? "" : "border-b border-line last:border-0"}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-burgundy">
                      {p.isPlusOne && <span className="text-muted">↳ </span>}
                      {p.name}
                      {p.isPlusOne && (
                        <span className="font-util text-[0.6rem] tracking-[0.14em] uppercase text-muted ml-2">
                          +1 of {p.broughtBy}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {p.isPlusOne ? "—" : (r.email ?? "—")}
                    </td>
                    <td className="px-4 py-3">{r.attending ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 capitalize">{r.events_attending ?? "—"}</td>
                    <td className="px-4 py-3">{p.isPlusOne ? "—" : (r.party_size ?? 1)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.meal_preference ?? "—"}</td>
                    <td className="px-4 py-3 max-w-xs text-muted">
                      {p.isPlusOne ? "" : (r.message ?? "")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {fmtDate(r.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {/* the +1 lives on the submission, so only it can be deleted */}
                      {!p.isPlusOne && (
                        <DeleteRsvp
                          id={r.id}
                          name={r.full_name}
                          guestName={r.guest_name}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
