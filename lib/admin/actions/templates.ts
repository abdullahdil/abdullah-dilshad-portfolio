"use server";

import { revalidatePath } from "next/cache";
import {
  firstZodError,
  formBool,
  formInt,
  formString,
  linesToArray,
} from "@/lib/admin/form-utils";
import type { ActionResult } from "@/lib/admin/types";
import { requireAuthorizedAdmin } from "@/lib/auth/session";
import {
  createAdminTemplate,
  deleteAdminTemplate,
  updateAdminTemplate,
} from "@/lib/repositories/admin/templates";
import { templateSchema } from "@/lib/validations/template";

function parseTemplate(formData: FormData) {
  return templateSchema.safeParse({
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    externalUrl: formString(formData, "externalUrl"),
    tools: linesToArray(formString(formData, "tools")),
    accent: formString(formData, "accent") || "primary",
    displayOrder: formInt(formData, "displayOrder", 0),
    isPublished: formBool(formData, "isPublished"),
  });
}

export async function saveTemplateAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");
  const parsed = parseTemplate(formData);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    if (id) {
      await updateAdminTemplate(id, parsed.data);
    } else {
      await createAdminTemplate(parsed.data);
    }
    revalidatePath("/");
    revalidatePath("/admin/templates");
    return { ok: true, message: id ? "Template updated." : "Template created." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save template.",
    };
  }
}

export async function deleteTemplateAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  await deleteAdminTemplate(formString(formData, "id"));
  revalidatePath("/");
  revalidatePath("/admin/templates");
}
