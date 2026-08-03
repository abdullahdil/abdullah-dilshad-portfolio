"use server";

import { revalidatePath } from "next/cache";
import {
  firstZodError,
  formString,
  linesToArray,
} from "@/lib/admin/form-utils";
import type { ActionResult } from "@/lib/admin/types";
import { requireAuthorizedAdmin } from "@/lib/auth/session";
import { upsertAdminProfile } from "@/lib/repositories/admin/profile";
import { profileSchema } from "@/lib/validations/profile";

export async function updateProfileAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();

  const parsed = profileSchema.safeParse({
    fullName: formString(formData, "fullName"),
    professionalTitle: formString(formData, "professionalTitle"),
    heroHeadline: formString(formData, "heroHeadline"),
    heroDescription: formString(formData, "heroDescription"),
    shortBio: formString(formData, "shortBio"),
    longBio: linesToArray(formString(formData, "longBio")),
    location: formString(formData, "location"),
    availabilityStatus: formString(formData, "availabilityStatus") || "available",
    availabilityLabel: formString(formData, "availabilityLabel"),
    email: formString(formData, "email"),
    linkedinUrl: formString(formData, "linkedinUrl"),
    githubUrl: formString(formData, "githubUrl"),
    n8nProfileUrl: formString(formData, "n8nProfileUrl"),
    credentialUrl: formString(formData, "credentialUrl"),
    cvUrl: formString(formData, "cvUrl"),
    portraitUrl: formString(formData, "portraitUrl"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    await upsertAdminProfile(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin/profile");
    return { ok: true, message: "Profile saved." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save profile.",
    };
  }
}
