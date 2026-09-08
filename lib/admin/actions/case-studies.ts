"use server";

import { revalidatePath } from "next/cache";
import {
  cleanUpRemovedImages,
  listCaseStudyImageUrls,
} from "@/lib/repositories/admin/media-cleanup";
import { redirect } from "next/navigation";
import {
  arrayToLines,
  firstZodError,
  formBool,
  formInt,
  formString,
  linesToArray,
  parseJsonField,
} from "@/lib/admin/form-utils";
import type { ActionResult } from "@/lib/admin/types";
import { requireAuthorizedAdmin } from "@/lib/auth/session";
import {
  createAdminCaseStudy,
  deleteAdminCaseStudy,
  updateAdminCaseStudy,
  updateAdminCaseStudyStatus,
} from "@/lib/repositories/admin/case-studies";
import {
  architectureNodeSchema,
  caseStudySchema,
  caseStudyStepSchema,
  caseStudyToolSchema,
  galleryImageSchema,
  reliabilityControlSchema,
} from "@/lib/validations/case-study";
import { contentStatusSchema, toSlug } from "@/lib/validations/common";
import { z } from "zod";

function parseCaseStudyForm(formData: FormData) {
  const title = formString(formData, "title");
  const slugRaw = formString(formData, "slug");
  const slug = slugRaw || toSlug(title);

  const nodes = parseJsonField(
    formString(formData, "architectureNodesJson"),
    z.array(architectureNodeSchema).min(1),
    "Architecture nodes",
  );
  if (!nodes.ok) return nodes;

  const steps = parseJsonField(
    formString(formData, "stepsJson"),
    z.array(caseStudyStepSchema).min(1),
    "Steps",
  );
  if (!steps.ok) return steps;

  const tools = parseJsonField(
    formString(formData, "toolsJson"),
    z.array(caseStudyToolSchema).min(1),
    "Tools",
  );
  if (!tools.ok) return tools;

  const controls = parseJsonField(
    formString(formData, "reliabilityControlsJson"),
    z.array(reliabilityControlSchema).min(1),
    "Reliability controls",
  );
  if (!controls.ok) return controls;

  const galleryRaw = formString(formData, "galleryImagesJson");
  let galleryImages: z.infer<typeof galleryImageSchema>[] = [];
  if (galleryRaw.trim()) {
    const gallery = parseJsonField(
      galleryRaw,
      z.array(galleryImageSchema),
      "Gallery images",
    );
    if (!gallery.ok) return gallery;
    galleryImages = gallery.data;
  } else {
    galleryImages = linesToArray(formString(formData, "galleryPlaceholders")).map(
      (caption) => ({ caption, url: "", alt: caption }),
    );
  }

  const parsed = caseStudySchema.safeParse({
    title,
    slug,
    summary: formString(formData, "summary"),
    businessProblem: formString(formData, "businessProblem"),
    beforeState: formString(formData, "beforeState"),
    beforeIssues: linesToArray(formString(formData, "beforeIssues")),
    architectureDescription: formString(formData, "architectureDescription"),
    architectureNodes: nodes.data,
    steps: steps.data,
    tools: tools.data,
    contribution: linesToArray(formString(formData, "contribution")),
    reliabilityControls: controls.data,
    result: formString(formData, "result"),
    accent: formString(formData, "accent") || "primary",
    previewLabel: formString(formData, "previewLabel") || "Architecture preview",
    status: formString(formData, "status") || "draft",
    featuredImageUrl: formString(formData, "featuredImageUrl"),
    demoVideoUrl: formString(formData, "demoVideoUrl"),
    galleryImages,
    galleryPlaceholders: galleryImages
      .filter((item) => !item.url)
      .map((item) => item.caption),
    demoVideoLabel: formString(formData, "demoVideoLabel") || "Demo video coming soon",
  });

  if (!parsed.success) {
    return { ok: false as const, error: firstZodError(parsed.error) };
  }

  return {
    ok: true as const,
    data: parsed.data,
    displayOrder: formInt(formData, "displayOrder", 0),
    isFeatured: formBool(formData, "isFeatured"),
  };
}

export async function createCaseStudyAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();
  const parsed = parseCaseStudyForm(formData);
  if (!parsed.ok) return parsed;

  let id: string;
  try {
    id = await createAdminCaseStudy(parsed.data, {
      displayOrder: parsed.displayOrder,
      isFeatured: parsed.isFeatured,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to create case study.",
    };
  }

  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin/case-studies");
  redirect(`/admin/case-studies/${id}/edit?saved=1`);
}

export async function updateCaseStudyAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");
  if (!id) return { ok: false, error: "Missing case study id." };

  const parsed = parseCaseStudyForm(formData);
  if (!parsed.ok) return parsed;

  try {
    // Snapshot the current images so we can delete whatever this save drops.
    let imagesBefore: string[] = [];
    try {
      imagesBefore = await listCaseStudyImageUrls(id);
    } catch {
      imagesBefore = [];
    }

    await updateAdminCaseStudy(id, parsed.data, {
      displayOrder: parsed.displayOrder,
      isFeatured: parsed.isFeatured,
    });

    const imagesAfter = await listCaseStudyImageUrls(id).catch(() => imagesBefore);
    await cleanUpRemovedImages(imagesBefore, imagesAfter);

    revalidatePath("/");
    revalidatePath(`/work/${parsed.data.slug}`);
    revalidatePath("/work/[slug]", "page");
    revalidatePath("/admin/case-studies");
    revalidatePath(`/admin/case-studies/${id}/edit`);
    return { ok: true, message: "Case study saved.", id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update case study.",
    };
  }
}

export async function setCaseStudyStatusAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");
  const status = contentStatusSchema.parse(formString(formData, "status"));
  await updateAdminCaseStudyStatus(id, status);
  revalidatePath("/");
  revalidatePath("/work/[slug]", "page");
  revalidatePath("/admin/case-studies");
  redirect("/admin/case-studies");
}

export async function deleteCaseStudyAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  const id = formString(formData, "id");

  let images: string[] = [];
  try {
    images = await listCaseStudyImageUrls(id);
  } catch {
    images = [];
  }

  await deleteAdminCaseStudy(id);
  await cleanUpRemovedImages(images, []);

  revalidatePath("/");
  revalidatePath("/work/[slug]", "page");
  revalidatePath("/admin/case-studies");
  redirect("/admin/case-studies");
}

export { arrayToLines };
