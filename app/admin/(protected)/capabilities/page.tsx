import { CapabilityManager } from "@/components/admin/capability-manager";
import { listAdminCapabilities } from "@/lib/repositories/admin/capabilities";

export const metadata = { title: "Capabilities" };

export default async function AdminCapabilitiesPage() {
  const items = await listAdminCapabilities();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">Capabilities</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Skill rows grouped by category on the public capabilities section.
        </p>
      </div>
      <CapabilityManager items={items} />
    </div>
  );
}
