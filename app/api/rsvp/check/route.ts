import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Public, privacy-preserving check for the RSVP form: given a typed name, is the
 * reception closed for them? Returns only a boolean — the closed list itself is
 * never exposed. Fails OPEN (blocked:false) on any error so a real guest is
 * never wrongly turned away; the server-side RSVP route is the hard backstop.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ blocked: false });
  }

  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ blocked: false });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reception_blocked", {
    check_name: name,
  });
  if (error) {
    console.error("[api/rsvp/check]", error.message);
    return NextResponse.json({ blocked: false });
  }

  return NextResponse.json({ blocked: Boolean(data) });
}
