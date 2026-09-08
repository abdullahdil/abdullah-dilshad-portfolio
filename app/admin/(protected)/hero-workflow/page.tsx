import { HeroWorkflowManager } from "@/components/admin/hero-workflow-manager";
import { listAdminHeroWorkflowSteps } from "@/lib/repositories/admin/site-content";

export const metadata = { title: "Hero Workflow" };

export default async function AdminHeroWorkflowPage() {
  const items = await listAdminHeroWorkflowSteps();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">
          Hero Workflow Diagram
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Steps in the left-to-right workflow visual.
        </p>
      </div>
      <HeroWorkflowManager items={items} />
    </div>
  );
}
