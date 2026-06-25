import { GalleryManager } from "@/components/admin/GalleryManager";
import { listRows } from "@/lib/admin/data";
import type { Photo } from "@/lib/types";

export default async function GalleryPage() {
  const photos = (await listRows("photos", "sort_order")) as unknown as Photo[];
  return <GalleryManager photos={photos} />;
}
