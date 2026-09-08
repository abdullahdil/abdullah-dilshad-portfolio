import { WorkflowManager } from "@/components/admin/workflow-manager";
import {
  listAdminWorkflowGroups,
  listAdminWorkflows,
} from "@/lib/repositories/admin/site-content";

export const metadata = { title: "Workflows" };

export default async function AdminWorkflowsPage() {
  const [groups, workflows] = await Promise.all([
    listAdminWorkflowGroups(),
    listAdminWorkflows(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">Workflows</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          The public workflow catalog, grouped by category.
        </p>
      </div>
      <WorkflowManager groups={groups} workflows={workflows} />
    </div>
  );
}
