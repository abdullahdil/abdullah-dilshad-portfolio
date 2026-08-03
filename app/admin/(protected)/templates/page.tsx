import { TemplateManager } from "@/components/admin/template-manager";
import { listAdminTemplates } from "@/lib/repositories/admin/templates";

export const metadata = { title: "Templates" };

export default async function AdminTemplatesPage() {
  const items = await listAdminTemplates();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">Public Templates</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          n8n creator templates shown on the homepage.
        </p>
      </div>
      <TemplateManager items={items} />
    </div>
  );
}
