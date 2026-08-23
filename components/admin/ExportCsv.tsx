"use client";

import type { RsvpRow } from "@/lib/admin/rsvpTypes";
import { expandToPeople, type RsvpPerson } from "@/lib/admin/rsvpPeople";

/**
 * One line per person, not per submission — a guest who brings a +1 exports as
 * two named rows, so the sheet can be used directly for seating and catering.
 * Fields that belong to the submission rather than the person (email, party
 * size, message) stay on the primary line so nothing is double-counted.
 */
const COLUMNS: { label: string; value: (p: RsvpPerson) => unknown }[] = [
  { label: "Full name", value: (p) => p.name },
  { label: "Guest type", value: (p) => (p.isPlusOne ? "+1" : "Primary") },
  { label: "Guest of", value: (p) => p.broughtBy ?? "" },
  { label: "Email", value: (p) => (p.isPlusOne ? "" : p.rsvp.email) },
  { label: "Attending", value: (p) => p.rsvp.attending },
  { label: "Events", value: (p) => p.rsvp.events_attending },
  { label: "Party size", value: (p) => (p.isPlusOne ? "" : (p.rsvp.party_size ?? 1)) },
  { label: "Meal", value: (p) => p.rsvp.meal_preference },
  { label: "Message", value: (p) => (p.isPlusOne ? "" : p.rsvp.message) },
  { label: "Submitted", value: (p) => p.rsvp.created_at },
];

function cell(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function ExportCsv({ rows }: { rows: RsvpRow[] }) {
  function download() {
    const header = COLUMNS.map((c) => c.label).join(",");
    const lines = expandToPeople(rows).map((p) =>
      COLUMNS.map((c) => cell(c.value(p))).join(","),
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rsvps.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      className="btn-gold w-auto px-6"
      onClick={download}
      disabled={rows.length === 0}
    >
      Export CSV
    </button>
  );
}
