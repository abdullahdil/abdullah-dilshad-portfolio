import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminSiteSettings } from "@/lib/repositories/admin/settings";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getAdminSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">Site Settings</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Availability and site-wide notes. Manage files under Media.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
