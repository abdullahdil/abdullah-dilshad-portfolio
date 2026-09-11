"use server";

import { revalidatePath } from "next/cache";
import { requireAuthorizedAdmin } from "@/lib/auth/session";
import {
  deleteWorkflowAccessRequest,
  updateWorkflowAccessRequestStatus,
  type WorkflowAccessStatus,
} from "@/lib/repositories/admin/workflow-access";

const statuses: WorkflowAccessStatus[] = [
  "pending",
  "sent",
  "declined",
  "archived",
];

function isStatus(value: string): value is WorkflowAccessStatus {
  return statuses.includes(value as WorkflowAccessStatus);
}

function revalidate() {
  revalidatePath("/admin");
  revalidatePath("/admin/access-requests");
}

export async function updateWorkflowAccessStatusAction(
  formData: FormData,
): Promise<void> {
  await requireAuthorizedAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !isStatus(status)) return;

  await updateWorkflowAccessRequestStatus(id, status);
  revalidate();
}

export async function deleteWorkflowAccessRequestAction(
  formData: FormData,
): Promise<void> {
  await requireAuthorizedAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await deleteWorkflowAccessRequest(id);
  revalidate();
}
