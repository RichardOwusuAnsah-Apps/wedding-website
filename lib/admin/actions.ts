"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { RESOURCE_BY_TABLE } from "@/lib/admin/config";

type Result = { ok?: true; error?: string };

// Tables the public/admin may delete rows from.
const DELETABLE = new Set([
  ...Object.keys(RESOURCE_BY_TABLE),
  "photos",
  "guestbook",
]);

async function authedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return supabase;
}

const clampNum = (raw: unknown, lo: number, hi: number, fallback: number) => {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
};

/** Coerce form values to column types, keeping only configured columns. */
function sanitize(table: string, data: Record<string, unknown>) {
  const res = RESOURCE_BY_TABLE[table];
  const out: Record<string, unknown> = {};
  for (const f of res.fields) {
    const raw = data[f.name];
    if (f.type === "number") {
      const n = Number(raw);
      out[f.name] = Number.isFinite(n) ? n : 0;
    } else {
      const s = raw == null ? "" : String(raw).trim();
      out[f.name] = s === "" ? null : s;
    }
  }
  // image-bearing tables also persist the crop (focal point + zoom)
  if (res.fields.some((f) => f.type === "image")) {
    out.focal_x = Math.round(clampNum(data.focal_x, 0, 100, 50));
    out.focal_y = Math.round(clampNum(data.focal_y, 0, 100, 50));
    out.zoom = clampNum(data.zoom, 1, 4, 1);
  }
  return out;
}

function revalidateFor(table: string) {
  const res = RESOURCE_BY_TABLE[table];
  if (res) revalidatePath(`/admin/${res.slug}`);
  revalidatePath("/"); // public site
}

export async function saveRow(
  table: string,
  id: string | null,
  data: Record<string, unknown>,
): Promise<Result> {
  if (!RESOURCE_BY_TABLE[table]) return { error: "Unknown table" };
  const supabase = await authedClient();
  if (!supabase) return { error: "Not signed in" };

  const clean = sanitize(table, data);
  const { error } = id
    ? await supabase.from(table).update(clean).eq("id", id)
    : await supabase.from(table).insert(clean);
  if (error) return { error: error.message };

  revalidateFor(table);
  return { ok: true };
}

export async function deleteRow(table: string, id: string): Promise<Result> {
  if (!DELETABLE.has(table)) return { error: "Unknown table" };
  const supabase = await authedClient();
  if (!supabase) return { error: "Not signed in" };

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { error: error.message };

  if (table === "photos") revalidatePath("/admin/gallery");
  else if (table === "guestbook") revalidatePath("/admin/guestbook");
  revalidateFor(table);
  return { ok: true };
}

export async function saveSettings(
  values: Record<string, string>,
): Promise<Result> {
  const supabase = await authedClient();
  if (!supabase) return { error: "Not signed in" };

  const rows = Object.entries(values).map(([key, value]) => ({
    key,
    value: value ?? "",
  }));
  const { error } = await supabase.from("settings").upsert(rows);
  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true };
}

export async function addPhoto(input: {
  gallery: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
}): Promise<Result> {
  const supabase = await authedClient();
  if (!supabase) return { error: "Not signed in" };

  const { error } = await supabase.from("photos").insert(input);
  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { ok: true };
}

export async function updatePhoto(
  id: string,
  patch: {
    caption?: string | null;
    sort_order?: number;
    is_featured?: boolean;
    focal_x?: number;
    focal_y?: number;
    zoom?: number;
  },
): Promise<Result> {
  const supabase = await authedClient();
  if (!supabase) return { error: "Not signed in" };

  const { error } = await supabase.from("photos").update(patch).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { ok: true };
}

export async function setGuestbookStatus(
  id: string,
  status: "pending" | "approved",
): Promise<Result> {
  const supabase = await authedClient();
  if (!supabase) return { error: "Not signed in" };

  const { error } = await supabase
    .from("guestbook")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/guestbook");
  revalidatePath("/");
  return { ok: true };
}

/** Best-effort removal of a storage object (e.g. when replacing a photo). */
export async function removeStorageObject(
  bucket: string,
  path: string,
): Promise<Result> {
  if (bucket !== "party-photos" && bucket !== "gallery")
    return { error: "Unknown bucket" };
  const supabase = await authedClient();
  if (!supabase) return { error: "Not signed in" };

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) return { error: error.message };
  return { ok: true };
}
