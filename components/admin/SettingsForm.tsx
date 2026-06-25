"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveSettings } from "@/lib/admin/actions";
import type { Settings } from "@/lib/types";

const FIELDS: { key: string; label: string; type: "text" | "textarea"; hint?: string }[] = [
  { key: "couple_names", label: "Couple names", type: "text" },
  {
    key: "wedding_date",
    label: "Wedding date & time",
    type: "text",
    hint: "Format: 2026-10-24T14:00:00 (drives the hero countdown & after-wedding gate)",
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
    const v: Record<string, string> = {};
    for (const f of FIELDS) v[f.key] = initial[f.key] ?? "";
    return v;
  });
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

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <h1 className="font-display text-4xl text-burgundy mb-6">Settings</h1>

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
