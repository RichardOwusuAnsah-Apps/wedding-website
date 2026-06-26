"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveRow, deleteRow, reorderRows } from "@/lib/admin/actions";
import { publicImageUrl, initials } from "@/lib/storage";
import { focalStyle } from "@/lib/image";
import { ImageCropper, type Crop } from "@/components/admin/ImageCropper";
import type { PartyMember } from "@/lib/types";

type Group = { key: string; label: string };
type Side = { key: "groom" | "bride"; label: string; groups: Group[] };

const SIDES: Side[] = [
  {
    key: "groom",
    label: "Groom's Side",
    groups: [
      { key: "best_man", label: "Best Man" },
      { key: "groomsmen", label: "Groomsmen" },
      { key: "trad_men", label: "Traditional Wedding Men" },
    ],
  },
  {
    key: "bride",
    label: "Bride's Side",
    groups: [
      { key: "maid_of_honour", label: "Maids of Honour" },
      { key: "bridesmaids", label: "Bridesmaids" },
      { key: "trad_ladies", label: "Traditional Wedding Ladies" },
    ],
  },
];

async function uploadPortrait(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("party-photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return path;
}

function Thumb({ member }: { member: PartyMember }) {
  return (
    <div className="relative w-12 h-16 shrink-0 rounded overflow-hidden border border-line bg-sand flex items-center justify-center">
      {member.photo_path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={publicImageUrl("party-photos", member.photo_path)}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={focalStyle(member)}
        />
      ) : (
        <span className="font-display text-burgundy text-sm">
          {initials(member.name)}
        </span>
      )}
    </div>
  );
}

function MemberEditor({
  member,
  side,
  groupKey,
  nextOrder,
  onClose,
}: {
  member: PartyMember | null;
  side: string;
  groupKey: string;
  nextOrder: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [photo, setPhoto] = useState(member?.photo_path ?? "");
  const [crop, setCrop] = useState<Crop>({
    focal_x: member?.focal_x ?? 50,
    focal_y: member?.focal_y ?? 50,
    zoom: member?.zoom ?? 1,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      setPhoto(await uploadPortrait(file));
      setCrop({ focal_x: 50, focal_y: 50, zoom: 1 });
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function save() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    startTransition(async () => {
      const res = await saveRow("wedding_party", member?.id ?? null, {
        side,
        group_key: groupKey,
        name: name.trim(),
        role: role.trim(),
        photo_path: photo || null,
        sort_order: member?.sort_order ?? nextOrder,
        focal_x: crop.focal_x,
        focal_y: crop.focal_y,
        zoom: crop.zoom,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  function remove() {
    if (!member) return;
    if (!confirm(`Delete ${member.name || "this person"}?`)) return;
    startTransition(async () => {
      await deleteRow("wedding_party", member.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="bg-white border border-line rounded-md p-4 grid sm:grid-cols-[180px_1fr] gap-5">
      <div>
        {photo ? (
          <>
            <ImageCropper
              url={publicImageUrl("party-photos", photo)}
              aspect={3 / 4}
              value={crop}
              onChange={setCrop}
            />
            <label className="mt-2 inline-block font-util text-[0.62rem] tracking-[0.14em] uppercase text-teal cursor-pointer">
              Replace photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={onFile}
              />
            </label>
          </>
        ) : (
          <label
            className="w-full rounded border border-dashed border-gold bg-[rgba(196,154,72,0.06)] hover:bg-[rgba(196,154,72,0.12)] transition flex flex-col items-center justify-center gap-1.5 text-muted cursor-pointer"
            style={{ aspectRatio: "3 / 4" }}
          >
            <span className="text-2xl text-gold leading-none">+</span>
            <span className="font-util text-[0.6rem] tracking-[0.14em] uppercase">
              Click to upload
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={onFile}
            />
          </label>
        )}
        {uploading && <p className="form-note">Uploading…</p>}
      </div>

      <div>
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
          />
        </div>
        <div className="field">
          <label>Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Best Man, Maid of Honour, Groomsman…"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            className="btn-gold w-auto px-7"
            onClick={save}
            disabled={pending || uploading}
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className="font-util text-[0.7rem] tracking-[0.14em] uppercase text-muted"
            onClick={onClose}
          >
            Cancel
          </button>
          {member && (
            <button
              type="button"
              className="font-util text-[0.7rem] tracking-[0.14em] uppercase text-burgundy ml-auto"
              onClick={remove}
              disabled={pending}
            >
              Delete
            </button>
          )}
          {error && <span className="form-note error mt-0">{error}</span>}
        </div>
      </div>
    </div>
  );
}

function GroupSection({
  side,
  group,
  members,
}: {
  side: string;
  group: Group;
  members: PartyMember[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const ids = members.map((m) => m.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    setDragId(null);
    setOverId(null);
    startTransition(async () => {
      await reorderRows("wedding_party", ids);
      router.refresh();
    });
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xl text-teal">{group.label}</h3>
        {!adding && (
          <button
            className="font-util text-[0.66rem] tracking-[0.14em] uppercase text-burgundy border border-line rounded-[2px] px-3 py-1.5 hover:bg-sand"
            onClick={() => setAdding(true)}
          >
            + Add Person
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-3">
          <MemberEditor
            member={null}
            side={side}
            groupKey={group.key}
            nextOrder={members.length}
            onClose={() => setAdding(false)}
          />
        </div>
      )}

      {members.length === 0 && !adding ? (
        <p className="text-muted text-[0.95rem] italic px-1 py-2">
          No one added yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {members.map((m) =>
            editingId === m.id ? (
              <li key={m.id}>
                <MemberEditor
                  member={m}
                  side={side}
                  groupKey={group.key}
                  nextOrder={m.sort_order}
                  onClose={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li
                key={m.id}
                draggable
                onDragStart={() => setDragId(m.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverId(m.id);
                }}
                onDrop={() => handleDrop(m.id)}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                className={`flex items-center gap-3 bg-white border rounded-md px-3 py-2 cursor-grab active:cursor-grabbing transition ${
                  overId === m.id ? "border-gold" : "border-line"
                } ${dragId === m.id ? "opacity-50" : ""}`}
              >
                <span
                  className="text-muted select-none leading-none"
                  aria-hidden
                  title="Drag to reorder"
                >
                  ⠿
                </span>
                <Thumb member={m} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg text-burgundy truncate">
                    {m.name || "(no name)"}
                  </p>
                  {m.role && (
                    <p className="font-util text-[0.6rem] tracking-[0.16em] uppercase text-muted">
                      {m.role}
                    </p>
                  )}
                </div>
                <button
                  className="font-util text-[0.66rem] tracking-[0.14em] uppercase text-teal shrink-0"
                  onClick={() => setEditingId(m.id)}
                >
                  Edit
                </button>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

export function PartyManager({ members }: { members: PartyMember[] }) {
  return (
    <div>
      <h1 className="font-display text-4xl text-burgundy mb-2">Wedding Party</h1>
      <p className="text-muted mb-8 text-[0.95rem]">
        Add people under each group, upload &amp; frame their portrait, and drag
        rows to reorder.
      </p>

      {SIDES.map((side) => (
        <section key={side.key} className="mb-10">
          <h2 className="font-display text-2xl text-burgundy border-b border-line pb-2 mb-5">
            {side.label}
          </h2>
          {side.groups.map((group) => (
            <GroupSection
              key={group.key}
              side={side.key}
              group={group}
              members={members
                .filter((m) => m.side === side.key && m.group_key === group.key)
                .sort((a, b) => a.sort_order - b.sort_order)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
