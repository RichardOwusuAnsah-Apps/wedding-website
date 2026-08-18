"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveSettings } from "@/lib/admin/actions";
import { createClient } from "@/lib/supabase/client";
import { publicImageUrl } from "@/lib/storage";
import type { Settings } from "@/lib/types";

const FIELDS: { key: string; label: string; type: "text" | "textarea"; hint?: string }[] = [
  { key: "couple_names", label: "Couple names", type: "text" },
  {
    key: "wedding_date",
    label: "Wedding date & time",
    type: "text",
    hint: "Format: 2026-10-24T14:00:00 (drives the hero countdown & after-wedding gate). Leave blank to hide the date and countdown.",
  },
  { key: "hero_location", label: "Location", type: "text" },
  { key: "tagline", label: "Tagline", type: "text" },
  { key: "hashtag", label: "Hashtag", type: "text" },
  { key: "rsvp_deadline", label: "RSVP deadline", type: "text", hint: "Format: 2026-09-24" },
  { key: "livestream_url", label: "Livestream URL", type: "text" },
  { key: "registry_note", label: "Registry note", type: "textarea" },
];

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = { monogram_path: initial.monogram_path ?? "" };
    for (const f of FIELDS) v[f.key] = initial[f.key] ?? "";
    return v;
  });
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState<{ kind: "error" | "success"; text: string } | null>(
    null,
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setNote(null);
    startTransition(async () => {
      const res = await saveSettings(values);
      if (res.error) setNote({ kind: "error", text: res.error });
      else {
        setNote({ kind: "success", text: "Saved." });
        router.refresh();
      }
    });
  }

  // Monogram upload persists immediately so it applies without a full Save.
  async function persist(next: Record<string, string>) {
    setValues(next);
    const res = await saveSettings(next);
    if (res.error) setNote({ kind: "error", text: res.error });
    else {
      setNote({ kind: "success", text: "Monogram updated." });
      router.refresh();
    }
  }

  async function onMonogramFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNote(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const path = `brand/monogram-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("gallery")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      await persist({ ...values, monogram_path: path });
    } catch {
      setNote({ kind: "error", text: "Upload failed. Try again." });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function removeMonogram() {
    await persist({ ...values, monogram_path: "" });
  }

  const monogramUrl = values.monogram_path
    ? publicImageUrl("gallery", values.monogram_path)
    : "";

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <h1 className="font-display text-4xl text-burgundy mb-6">Settings</h1>

      {/* Monogram / logo */}
      <div className="bg-white border border-line rounded-md p-6 mb-6">
        <p className="font-util text-[0.7rem] tracking-[0.14em] uppercase text-muted mb-3">
          Monogram / Logo
        </p>
        <p className="text-sm text-muted mb-4">
          Used in the top-left corner, the centre of the hero, and as the browser
          tab icon. Leave empty to use the default “RS”. A square PNG with a
          transparent background works best.
        </p>
        <div className="flex items-center gap-5">
          <div
            className="shrink-0 flex items-center justify-center rounded border border-line bg-sand overflow-hidden"
            style={{ width: 96, height: 96 }}
          >
            {monogramUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={monogramUrl}
                alt="Current monogram"
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            ) : (
              <span className="font-script text-3xl text-burgundy">RS</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="btn-gold w-auto px-6 cursor-pointer inline-block text-center">
              {uploading ? "Uploading…" : monogramUrl ? "Replace monogram" : "Upload monogram"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={onMonogramFile}
              />
            </label>
            {monogramUrl && (
              <button
                type="button"
                className="font-util text-[0.7rem] tracking-[0.14em] uppercase text-burgundy text-left"
                onClick={removeMonogram}
                disabled={uploading}
              >
                Remove monogram
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-line rounded-md p-6">
        {FIELDS.map((f) => (
          <div className="field" key={f.key}>
            <label htmlFor={f.key}>{f.label}</label>
            {f.type === "textarea" ? (
              <textarea
                id={f.key}
                rows={3}
                value={values[f.key]}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.key]: e.target.value }))
                }
              />
            ) : (
              <input
                id={f.key}
                type="text"
                value={values[f.key]}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.key]: e.target.value }))
                }
              />
            )}
            {f.hint && (
              <p className="font-util text-[0.62rem] tracking-[0.04em] text-muted mt-1">
                {f.hint}
              </p>
            )}
          </div>
        ))}

        <div className="flex items-center gap-4">
          <button className="btn-gold w-auto px-8" type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save settings"}
          </button>
          {note && <span className={`form-note ${note.kind} mt-0`}>{note.text}</span>}
        </div>
      </div>
    </form>
  );
}
