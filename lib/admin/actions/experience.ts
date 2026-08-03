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
  createAdminExperience,
  deleteAdminExperience,
  updateAdminExperience,
} from "@/lib/repositories/admin/experience";
import { experienceSchema } from "@/lib/validations/experience";

function parseExperience(formData: FormData) {
  return experienceSchema.safeParse({
    organization: formString(formData, "organization"),
    role: formString(formData, "role"),
    location: formString(formData, "location"),
    startDate: formString(formData, "startDate"),
    endDate: formString(formData, "endDate"),
    isCurrent: formBool(formData, "isCurrent"),
    description: formString(formData, "description"),
    displayOrder: formInt(formData, "displayOrder", 0),
    isPublished: formBool(formData, "isPublished"),
  });
}

export async function saveExperienceAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");
  const parsed = parseExperience(formData);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    if (id) {
      await updateAdminExperience(id, parsed.data);
    } else {
      await createAdminExperience(parsed.data);
    }
    revalidatePath("/");
    revalidatePath("/admin/experience");
    return { ok: true, message: id ? "Experience updated." : "Experience created." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save experience.",
    };
  }
}

export async function deleteExperienceAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  await deleteAdminExperience(formString(formData, "id"));
  revalidatePath("/");
  revalidatePath("/admin/experience");
}
