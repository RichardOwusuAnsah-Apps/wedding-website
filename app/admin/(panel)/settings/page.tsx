import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/queries";

export default async function SettingsPage() {
  const settings = await getSettings();
  return <SettingsForm initial={settings} />;
}
