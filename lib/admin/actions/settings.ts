"use server";

import { revalidatePath } from "next/cache";
import { firstZodError, formString } from "@/lib/admin/form-utils";
import type { ActionResult } from "@/lib/admin/types";
import { requireAuthorizedAdmin } from "@/lib/auth/session";
import { upsertAdminSiteSettings } from "@/lib/repositories/admin/settings";
import { siteSettingsSchema } from "@/lib/validations/settings";

export async function updateSettingsAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();

  const parsed = siteSettingsSchema.safeParse({
    availabilityStatus: formString(formData, "availabilityStatus") || "available",
    availabilityLabel: formString(formData, "availabilityLabel"),
    responseTimeNote: formString(formData, "responseTimeNote"),
    footerNote: formString(formData, "footerNote"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    await upsertAdminSiteSettings(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { ok: true, message: "Settings saved." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save settings.",
    };
  }
}
