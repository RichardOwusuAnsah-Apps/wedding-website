"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FieldDef, ResourceDef } from "@/lib/admin/config";
import { saveRow, deleteRow } from "@/lib/admin/actions";
import { createClient } from "@/lib/supabase/client";
import { publicImageUrl } from "@/lib/storage";
import { ImageCropper, type Crop } from "@/components/admin/ImageCropper";

type Row = Record<string, unknown>;

async function uploadToBucket(bucket: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

function Field({
  field,
  value,
  onChange,
  crop,
  onCrop,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
  crop?: Crop;
  onCrop?: (c: Crop) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const path = await uploadToBucket(field.bucket!, file);
      onChange(path);
      onCrop?.({ focal_x: 50, focal_y: 50, zoom: 1 }); // reset crop for new photo
    } catch {
      setErr("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  if (field.type === "textarea") {
    return (
      <div className="field">
        <label>{field.label}</label>
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="field">
        <label>{field.label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        >
          <option value="">— Select —</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "image") {
    return (
      <div className="field">
        <label>{field.label}</label>
        {value ? (
          <>
            <div className="max-w-[220px] mb-2">
              <ImageCropper
                url={publicImageUrl(field.bucket!, value)}
                aspect={field.aspect ?? 1}
                value={crop ?? { focal_x: 50, focal_y: 50, zoom: 1 }}
                onChange={(c) => onCrop?.(c)}
              />
            </div>
            <p className="font-util text-[0.54rem] tracking-[0.1em] uppercase text-muted mb-2">
              Drag to position · scroll to zoom
            </p>
            <div className="flex gap-5 items-center">
              <label className="font-util text-[0.66rem] tracking-[0.14em] uppercase text-teal cursor-pointer">
                Replace photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleUpload}
                />
              </label>
              <button
                type="button"
                className="font-util text-[0.66rem] tracking-[0.14em] uppercase text-burgundy"
                onClick={() => onChange("")}
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleUpload}
          />
        )}
        {uploading && <p className="form-note">Uploading…</p>}
        {err && <p className="form-note error">{err}</p>}
      </div>
    );
  }

  return (
    <div className="field">
      <label>{field.label}</label>
      <input
        type={field.type === "number" ? "number" : "text"}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
      />
    </div>
  );
}

function RowForm({
  resource,
  row,
  onClose,
}: {
  resource: ResourceDef;
  row: Row | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const hasImage = resource.fields.some((f) => f.type === "image");
  const [state, setState] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of resource.fields) {
      const v = row?.[f.name];
      init[f.name] = v == null ? "" : String(v);
    }
    if (hasImage) {
      init.focal_x = row?.focal_x == null ? "50" : String(row.focal_x);
      init.focal_y = row?.focal_y == null ? "50" : String(row.focal_y);
      init.zoom = row?.zoom == null ? "1" : String(row.zoom);
    }
    return init;
  });

  const crop: Crop = {
    focal_x: Number(state.focal_x ?? 50),
    focal_y: Number(state.focal_y ?? 50),
    zoom: Number(state.zoom ?? 1),
  };
  const setCrop = (c: Crop) =>
    setState((s) => ({
      ...s,
      focal_x: String(c.focal_x),
      focal_y: String(c.focal_y),
      zoom: String(c.zoom),
    }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await saveRow(
        resource.table,
        (row?.id as string) ?? null,
        state,
      );
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-line rounded-md p-6 mb-4"
    >
      {resource.fields.map((f) => (
        <Field
          key={f.name}
          field={f}
          value={state[f.name] ?? ""}
          onChange={(v) => setState((s) => ({ ...s, [f.name]: v }))}
          crop={f.type === "image" ? crop : undefined}
          onCrop={f.type === "image" ? setCrop : undefined}
        />
      ))}
      <div className="flex gap-3 items-center">
        <button className="btn-gold w-auto px-8" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          className="font-util text-[0.7rem] tracking-[0.14em] uppercase text-muted"
          onClick={onClose}
        >
          Cancel
        </button>
        {error && <span className="form-note error mt-0">{error}</span>}
      </div>
    </form>
  );
}

export function ResourceManager({
  resource,
  rows,
}: {
  resource: ResourceDef;
  rows: Row[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [, startTransition] = useTransition();

  function remove(id: string) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteRow(resource.table, id);
      if (res.error) alert(res.error);
      else router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl text-burgundy">{resource.title}</h1>
        {editing !== "new" && (
          <button
            className="btn-gold w-auto px-6"
            onClick={() => setEditing("new")}
          >
            Add {resource.singular}
          </button>
        )}
      </div>

      {editing === "new" && (
        <RowForm
          resource={resource}
          row={null}
          onClose={() => setEditing(null)}
        />
      )}

      {rows.length === 0 && editing !== "new" ? (
        <p className="text-muted">No items yet — add your first {resource.singular.toLowerCase()}.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => {
            const id = row.id as string;
            const title = (row[resource.titleField] as string) || "(untitled)";
            if (editing === id) {
              return (
                <li key={id}>
                  <RowForm
                    resource={resource}
                    row={row}
                    onClose={() => setEditing(null)}
                  />
                </li>
              );
            }
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-4 bg-white border border-line rounded-md px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="font-display text-xl text-burgundy truncate">
                    {title}
                  </p>
                  <p className="font-util text-[0.62rem] tracking-[0.14em] uppercase text-muted mt-1">
                    Order {String(row.sort_order ?? 0)}
                  </p>
                </div>
                <div className="flex gap-4 shrink-0">
                  <button
                    className="font-util text-[0.68rem] tracking-[0.14em] uppercase text-teal"
                    onClick={() => setEditing(id)}
                  >
                    Edit
                  </button>
                  <button
                    className="font-util text-[0.68rem] tracking-[0.14em] uppercase text-burgundy"
                    onClick={() => remove(id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
