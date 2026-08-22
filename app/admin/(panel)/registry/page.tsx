import { ResourceManager } from "@/components/admin/ResourceManager";
import { SectionToggle } from "@/components/admin/SectionToggle";
import { RESOURCES } from "@/lib/admin/config";
import { SECTION_TOGGLES, isSectionVisible } from "@/lib/sections";
import { listRows } from "@/lib/admin/data";
import { getSettings } from "@/lib/queries";

export default async function Page() {
  const resource = RESOURCES.registry;
  const [rows, settings] = await Promise.all([
    listRows(resource.table),
    getSettings(),
  ]);
  return (
    <div>
      <SectionToggle
        settingKey={SECTION_TOGGLES.registry.key}
        initialVisible={isSectionVisible(settings, "registry")}
      />
      <ResourceManager resource={resource} rows={rows} />
    </div>
  );
}
