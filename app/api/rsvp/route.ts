import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RsvpInput {
  full_name: string;
  email: string | null;
  attending: boolean;
  events_attending: string | null;
  party_size: number;
  meal_preference: string | null;
  message: string | null;
}

const EVENT_LABEL: Record<string, string> = {
  traditional: "Traditional Ceremony",
  white: "White Wedding",
  both: "Both celebrations",
};

/**
 * Public RSVP endpoint: saves the RSVP (RLS allows anon insert) and, if
 * RESEND_API_KEY is configured, emails the couple. Email is best-effort —
 * a notification failure never fails the RSVP (it's always in the admin).
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const fullName = String(body.full_name ?? "").trim();
  if (!fullName) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const row: RsvpInput = {
    full_name: fullName,
    email: body.email ? String(body.email).trim() : null,
    attending: Boolean(body.attending),
    events_attending: body.events_attending ? String(body.events_attending) : null,
    party_size: Number(body.party_size) || 1,
    meal_preference: body.meal_preference ? String(body.meal_preference) : null,
    message: body.message ? String(body.message).trim() : null,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("rsvps").insert(row);
  if (error) {
    console.error("[api/rsvp] insert:", error.message);
    return NextResponse.json({ error: "Could not save RSVP" }, { status: 500 });
  }

  await notify(row).catch((e) => console.error("[api/rsvp] email:", e));

  return NextResponse.json({ ok: true });
}

async function notify(row: RsvpInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  if (!apiKey || !to) return; // email simply disabled until configured

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const rows: [string, string][] = [
    ["Name", row.full_name],
    ["Attending", row.attending ? "Yes 🎉" : "No"],
    ["Celebrations", row.events_attending ? (EVENT_LABEL[row.events_attending] ?? row.events_attending) : "—"],
    ["Guests", String(row.party_size)],
    ["Meal", row.meal_preference ?? "—"],
    ["Email", row.email ?? "—"],
    ["Message", row.message ?? "—"],
  ];

  const html = `
    <div style="font-family:Georgia,serif;color:#241a1c">
      <h2 style="color:#5a1b2e;margin:0 0 12px">New RSVP — ${escapeHtml(row.full_name)}</h2>
      <table style="border-collapse:collapse">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:4px 16px 4px 0;color:#7a6a64;text-transform:uppercase;font-size:12px;letter-spacing:.08em">${k}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
          )
          .join("")}
      </table>
    </div>`;

  await resend.emails.send({
    from: "Wedding RSVP <onboarding@resend.dev>",
    to,
    subject: `New RSVP: ${row.full_name}${row.attending ? "" : " (declined)"}`,
    html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
