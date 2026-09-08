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
  clearAdminWorkflowImage,
  createAdminHeroWorkflowStep,
  createAdminNavLink,
  createAdminProofPoint,
  createAdminWorkflow,
  createAdminWorkflowGroup,
  deleteAdminHeroWorkflowStep,
  deleteAdminNavLink,
  deleteAdminProofPoint,
  deleteAdminWorkflow,
  deleteAdminWorkflowGroup,
  getAdminWorkflowImageUrl,
  updateAdminHeroWorkflowStep,
  updateAdminNavLink,
  updateAdminProofPoint,
  updateAdminWorkflow,
  updateAdminWorkflowGroup,
} from "@/lib/repositories/admin/site-content";
import { deleteUnreferencedStorageObject } from "@/lib/repositories/admin/media-cleanup";
import {
  heroWorkflowStepSchema,
  navLinkSchema,
  proofPointSchema,
  workflowGroupSchema,
  workflowSchema,
} from "@/lib/validations/site-content";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/** Comma-separated tag input -> trimmed, de-duplicated list. */
function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  for (const tag of raw.split(",")) {
    const trimmed = tag.trim();
    if (trimmed) seen.add(trimmed);
  }
  return [...seen];
}

// ---------------------------------------------------------------------------
// Proof points
// ---------------------------------------------------------------------------

export async function saveProofPointAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");
  const parsed = proofPointSchema.safeParse({
    value: formString(formData, "value"),
    label: formString(formData, "label"),
    isFeatured: formBool(formData, "isFeatured"),
    displayOrder: formInt(formData, "displayOrder", 0),
    isPublished: formBool(formData, "isPublished"),
  });
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  try {
    if (id) {
      await updateAdminProofPoint(id, parsed.data);
    } else {
      await createAdminProofPoint(parsed.data);
    }
    revalidatePath("/");
    revalidatePath("/admin/proof-points");
    return { ok: true, message: id ? "Proof point updated." : "Proof point created." };
  } catch (error) {
    return { ok: false, error: errorMessage(error, "Failed to save proof point.") };
  }
}

export async function deleteProofPointAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  await deleteAdminProofPoint(formString(formData, "id"));
  revalidatePath("/");
  revalidatePath("/admin/proof-points");
}

// ---------------------------------------------------------------------------
// Hero workflow steps
// ---------------------------------------------------------------------------

export async function saveHeroWorkflowStepAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");
  const parsed = heroWorkflowStepSchema.safeParse({
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    icon: formString(formData, "icon"),
    displayOrder: formInt(formData, "displayOrder", 0),
    isPublished: formBool(formData, "isPublished"),
  });
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  try {
    if (id) {
      await updateAdminHeroWorkflowStep(id, parsed.data);
    } else {
      await createAdminHeroWorkflowStep(parsed.data);
    }
    revalidatePath("/");
    revalidatePath("/admin/hero-workflow");
    return { ok: true, message: id ? "Step updated." : "Step created." };
  } catch (error) {
    return { ok: false, error: errorMessage(error, "Failed to save step.") };
  }
}

export async function deleteHeroWorkflowStepAction(
  formData: FormData,
): Promise<void> {
  await requireAuthorizedAdmin();
  await deleteAdminHeroWorkflowStep(formString(formData, "id"));
  revalidatePath("/");
  revalidatePath("/admin/hero-workflow");
}

// ---------------------------------------------------------------------------
// Nav links
// ---------------------------------------------------------------------------

export async function saveNavLinkAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");
  const parsed = navLinkSchema.safeParse({
    href: formString(formData, "href"),
    label: formString(formData, "label"),
    displayOrder: formInt(formData, "displayOrder", 0),
    isPublished: formBool(formData, "isPublished"),
  });
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  try {
    if (id) {
      await updateAdminNavLink(id, parsed.data);
    } else {
      await createAdminNavLink(parsed.data);
    }
    revalidatePath("/");
    revalidatePath("/admin/navigation");
    return { ok: true, message: id ? "Link updated." : "Link created." };
  } catch (error) {
    return { ok: false, error: errorMessage(error, "Failed to save link.") };
  }
}

export async function deleteNavLinkAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  await deleteAdminNavLink(formString(formData, "id"));
  revalidatePath("/");
  revalidatePath("/admin/navigation");
}

// ---------------------------------------------------------------------------
// Workflow groups
// ---------------------------------------------------------------------------

export async function saveWorkflowGroupAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");
  const parsed = workflowGroupSchema.safeParse({
    category: formString(formData, "category"),
    description: formString(formData, "description"),
    displayOrder: formInt(formData, "displayOrder", 0),
    isPublished: formBool(formData, "isPublished"),
  });
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  try {
    if (id) {
      await updateAdminWorkflowGroup(id, parsed.data);
    } else {
      await createAdminWorkflowGroup(parsed.data);
    }
    revalidatePath("/");
    revalidatePath("/admin/workflows");
    return { ok: true, message: id ? "Category updated." : "Category created." };
  } catch (error) {
    return { ok: false, error: errorMessage(error, "Failed to save category.") };
  }
}

export async function deleteWorkflowGroupAction(
  formData: FormData,
): Promise<void> {
  await requireAuthorizedAdmin();
  await deleteAdminWorkflowGroup(formString(formData, "id"));
  revalidatePath("/");
  revalidatePath("/admin/workflows");
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export async function saveWorkflowAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");
  const parsed = workflowSchema.safeParse({
    groupId: formString(formData, "groupId"),
    slug: formString(formData, "slug"),
    title: formString(formData, "title"),
    summary: formString(formData, "summary"),
    imageUrl: formString(formData, "imageUrl"),
    imageAlt: formString(formData, "imageAlt"),
    outcomeTags: parseTags(formString(formData, "outcomeTags")),
    isActive: formBool(formData, "isActive"),
    displayOrder: formInt(formData, "displayOrder", 0),
    isPublished: formBool(formData, "isPublished"),
  });
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  try {
    if (id) {
      await updateAdminWorkflow(id, parsed.data);
    } else {
      await createAdminWorkflow(parsed.data);
    }
    revalidatePath("/");
    revalidatePath("/admin/workflows");
    return { ok: true, message: id ? "Workflow updated." : "Workflow created." };
  } catch (error) {
    return { ok: false, error: errorMessage(error, "Failed to save workflow.") };
  }
}

export async function deleteWorkflowAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");

  // Drop the image file too, unless something else still points at it.
  let imageUrl: string | null = null;
  try {
    imageUrl = await getAdminWorkflowImageUrl(id);
  } catch {
    imageUrl = null;
  }

  await deleteAdminWorkflow(id);
  if (imageUrl) {
    try {
      await deleteUnreferencedStorageObject(imageUrl);
    } catch {
      // The row is already gone; a stray file must not fail the delete.
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/workflows");
}

/** Removes a workflow's image and deletes the file when nothing else uses it. */
export async function deleteWorkflowImageAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");
  if (!id) return { ok: false, error: "Missing workflow id." };

  try {
    const imageUrl = await getAdminWorkflowImageUrl(id);
    await clearAdminWorkflowImage(id);

    let message = "Image removed.";
    if (imageUrl) {
      const cleanup = await deleteUnreferencedStorageObject(imageUrl);
      message = cleanup.deleted
        ? "Image removed and the file was deleted from storage."
        : cleanup.reason ?? message;
    }

    revalidatePath("/");
    revalidatePath("/admin/workflows");
    return { ok: true, message };
  } catch (error) {
    return { ok: false, error: errorMessage(error, "Failed to remove image.") };
  }
}
