"use server";

import { revalidatePath } from "next/cache";
import { requireAuthorizedAdmin } from "@/lib/auth/session";
import {
  deleteMessage,
  updateMessageStatus,
} from "@/lib/repositories/admin/messages";
import type { ContactStatus } from "@/lib/supabase/database.types";

const statuses: ContactStatus[] = ["unread", "read", "archived"];

function isStatus(value: string): value is ContactStatus {
  return statuses.includes(value as ContactStatus);
}

export async function updateMessageStatusAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !isStatus(status)) return;

  await updateMessageStatus(id, status);
  revalidatePath("/admin");
  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await deleteMessage(id);
  revalidatePath("/admin");
  revalidatePath("/admin/messages");
}
