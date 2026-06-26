"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { addPhoto, updatePhoto, deleteRow } from "@/lib/admin/actions";
import { publicImageUrl } from "@/lib/storage";
import { focalStyle } from "@/lib/image";
import { PhotoPositioner } from "@/components/admin/PhotoPositioner";
import type { Photo } from "@/lib/types";

type GalleryKey = "pre_wedding" | "post_wedding";

function PhotoCard({ photo }: { photo: Photo }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [order, setOrder] = useState(String(photo.sort_order));
  const [adjusting, setAdjusting] = useState(false);

  return (
    <div className="bg-white border border-line rounded-md p-3">
      <div className="relative w-full aspect-square rounded overflow-hidden border border-line bg-sand mb-3">
        <Image
          src={publicImageUrl("gallery", photo.storage_path)}
          alt={photo.caption ?? "Photo"}
          fill
          sizes="(max-width:900px) 50vw, 220px"
          style={focalStyle(photo)}
        />
      </div>
      <input
        className="text-sm mb-2"
        style={{
          width: "100%",
          padding: "8px 10px",
          border: "1px solid var(--color-line)",
          borderRadius: 3,
          background: "var(--color-ivory)",
        }}
        placeholder="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <button
        type="button"
        disabled={pending}
        className={`w-full mb-2 font-util text-[0.6rem] tracking-[0.12em] uppercase py-2 rounded-[2px] border transition ${
          photo.is_featured
            ? "bg-gold text-white border-gold"
            : "border-line text-muted hover:text-burgundy"
        }`}
        onClick={() =>
          startTransition(async () => {
            await updatePhoto(photo.id, { is_featured: !photo.is_featured });
            router.refresh();
          })
        }
      >
        {photo.is_featured ? "★ Featured in hero" : "☆ Feature in hero"}
      </button>
      <div className="flex items-center gap-2">
        <input
          type="number"
          aria-label="Sort order"
          style={{
            width: 64,
            padding: "8px 10px",
            border: "1px solid var(--color-line)",
            borderRadius: 3,
            background: "var(--color-ivory)",
          }}
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        />
        <button
          className="font-util text-[0.64rem] tracking-[0.12em] uppercase text-teal"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updatePhoto(photo.id, {
                caption: caption.trim() || null,
                sort_order: Number(order) || 0,
              });
              router.refresh();
            })
          }
        >
          Save
        </button>
        <button
          className="font-util text-[0.64rem] tracking-[0.12em] uppercase text-burgundy ml-auto"
          disabled={pending}
          onClick={() => {
            if (!confirm("Delete this photo?")) return;
            startTransition(async () => {
              await deleteRow("photos", photo.id);
              router.refresh();
            });
          }}
        >
          Delete
        </button>
      </div>

      {!adjusting ? (
        <button
          type="button"
          className="w-full mt-2 font-util text-[0.6rem] tracking-[0.12em] uppercase py-2 rounded-[2px] border border-line text-muted hover:text-burgundy transition"
          onClick={() => setAdjusting(true)}
        >
          ⤢ Reposition / zoom
        </button>
      ) : (
        <PhotoPositioner
          url={publicImageUrl("gallery", photo.storage_path)}
          initial={{
            focal_x: photo.focal_x ?? 50,
            focal_y: photo.focal_y ?? 50,
            zoom: photo.zoom ?? 1,
          }}
          pending={pending}
          onCancel={() => setAdjusting(false)}
          onSave={(crop) =>
            startTransition(async () => {
              await updatePhoto(photo.id, crop);
              setAdjusting(false);
              router.refresh();
            })
          }
        />
      )}
    </div>
  );
}

export function GalleryManager({ photos }: { photos: Photo[] }) {
  const router = useRouter();
  const [gallery, setGallery] = useState<GalleryKey>("pre_wedding");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const shown = photos
    .filter((p) => p.gallery === gallery)
    .sort((a, b) => a.sort_order - b.sort_order);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const supabase = createClient();
    let order = shown.length;
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${gallery}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("gallery")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) {
        setError(`Upload failed: ${upErr.message}`);
        continue;
      }
      await addPhoto({
        gallery,
        storage_path: path,
        caption: null,
        sort_order: order++,
      });
    }
    setUploading(false);
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-burgundy mb-2">Gallery</h1>
      <p className="text-muted mb-6 text-[0.95rem]">
        Mark up to <strong>4</strong> photos as{" "}
        <span className="text-gold">★ Featured</span> to display them as the
        hero&apos;s hanging corner photos.
        {" "}
        {photos.filter((p) => p.is_featured).length} featured.
      </p>

      <div className="party-tabs" style={{ justifyContent: "flex-start" }}>
        <button
          className={`ptab${gallery === "pre_wedding" ? " active" : ""}`}
          onClick={() => setGallery("pre_wedding")}
        >
          Pre-Wedding
        </button>
        <button
          className={`ptab${gallery === "post_wedding" ? " active" : ""}`}
          onClick={() => setGallery("post_wedding")}
        >
          Post-Wedding
        </button>
      </div>

      <div className="bg-white border border-line rounded-md p-5 my-5">
        <label className="font-util text-[0.7rem] tracking-[0.16em] uppercase text-muted block mb-2">
          Upload photos to {gallery === "pre_wedding" ? "Pre-Wedding" : "Post-Wedding"}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => onFiles(e.target.files)}
        />
        {uploading && <p className="form-note">Uploading…</p>}
        {error && <p className="form-note error">{error}</p>}
      </div>

      {shown.length === 0 ? (
        <p className="text-muted">No photos in this gallery yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {shown.map((p) => (
            <PhotoCard key={p.id} photo={p} />
          ))}
        </div>
      )}
    </div>
  );
}
