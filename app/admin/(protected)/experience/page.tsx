import { ExperienceManager } from "@/components/admin/experience-manager";
import { listAdminExperience } from "@/lib/repositories/admin/experience";

export const metadata = { title: "Experience" };

export default async function AdminExperiencePage() {
  const items = await listAdminExperience();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">Experience</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage verified roles only. Do not invent employers or titles.
        </p>
      </div>
      <ExperienceManager items={items} />
    </div>
  );
}
