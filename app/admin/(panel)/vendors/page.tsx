import { ResourceManager } from "@/components/admin/ResourceManager";
import { RESOURCES } from "@/lib/admin/config";
import { listRows } from "@/lib/admin/data";

export default async function Page() {
  const resource = RESOURCES.vendors;
  const rows = await listRows(resource.table);
  return <ResourceManager resource={resource} rows={rows} />;
}
