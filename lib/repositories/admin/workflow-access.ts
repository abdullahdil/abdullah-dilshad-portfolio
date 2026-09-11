import type { WorkflowAccessRequestRow } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type WorkflowAccessStatus = WorkflowAccessRequestRow["status"];

async function requireClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

export async function listWorkflowAccessRequests(): Promise<
  WorkflowAccessRequestRow[]
> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("workflow_access_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as WorkflowAccessRequestRow[];
}

export async function countPendingWorkflowAccessRequests(): Promise<number> {
  const supabase = await requireClient();
  const { count, error } = await supabase
    .from("workflow_access_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
}

export async function updateWorkflowAccessRequestStatus(
  id: string,
  status: WorkflowAccessStatus,
): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("workflow_access_requests")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteWorkflowAccessRequest(id: string): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("workflow_access_requests")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
