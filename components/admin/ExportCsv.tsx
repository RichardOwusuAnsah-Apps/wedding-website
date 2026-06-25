"use client";

import type { RsvpRow } from "@/lib/admin/rsvpTypes";

const COLUMNS: { key: keyof RsvpRow; label: string }[] = [
  { key: "full_name", label: "Full name" },
  { key: "email", label: "Email" },
  { key: "attending", label: "Attending" },
  { key: "events_attending", label: "Events" },
  { key: "party_size", label: "Party size" },
  { key: "meal_preference", label: "Meal" },
  { key: "message", label: "Message" },
  { key: "created_at", label: "Submitted" },
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
    const lines = rows.map((r) =>
      COLUMNS.map((c) => cell(r[c.key])).join(","),
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
