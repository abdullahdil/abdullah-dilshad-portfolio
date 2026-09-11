import { AccessRequestInbox } from "@/components/admin/access-request-inbox";
import { listWorkflowAccessRequests } from "@/lib/repositories/admin/workflow-access";
import type { WorkflowAccessRequestRow } from "@/lib/supabase/database.types";

export const metadata = { title: "Access Requests" };

export default async function AdminAccessRequestsPage() {
  let requests: WorkflowAccessRequestRow[] = [];
  let error: string | null = null;

  try {
    requests = await listWorkflowAccessRequests();
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Failed to load access requests.";
  }

  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">
          Access Requests
          {pending > 0 ? (
            <span className="ml-3 inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 align-middle text-body-sm font-medium text-on-accent">
              {pending} pending
            </span>
          ) : null}
        </h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Workflow access requests · {pending} awaiting a reply ·{" "}
          {requests.length} total
        </p>
      </div>
      {error ? (
        <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      ) : (
        <AccessRequestInbox requests={requests} />
      )}
    </div>
  );
}
