"use server";

import { revalidatePath } from "next/cache";
import {
  firstZodError,
  formBool,
  formInt,
  formString,
} from "@/lib/admin/form-utils";
import type { ActionResult } from "@/lib/admin/types";
import { requireAuthorizedAdmin } from "@/lib/auth/session";
import {
  createAdminCapability,
  deleteAdminCapability,
  updateAdminCapability,
} from "@/lib/repositories/admin/capabilities";
import { capabilitySchema } from "@/lib/validations/capability";

function parseCapability(formData: FormData) {
  return capabilitySchema.safeParse({
    category: formString(formData, "category"),
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    displayOrder: formInt(formData, "displayOrder", 0),
    isPublished: formBool(formData, "isPublished"),
  });
}

export async function saveCapabilityAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");
  const parsed = parseCapability(formData);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    if (id) {
      await updateAdminCapability(id, parsed.data);
    } else {
      await createAdminCapability(parsed.data);
    }
    revalidatePath("/");
    revalidatePath("/admin/capabilities");
    return { ok: true, message: id ? "Capability updated." : "Capability created." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save capability.",
    };
  }
}

export async function deleteCapabilityAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  await deleteAdminCapability(formString(formData, "id"));
  revalidatePath("/");
  revalidatePath("/admin/capabilities");
}
