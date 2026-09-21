"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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
  createAdminNavLink,
  createAdminProofPoint,
  createAdminWorkflow,
  createAdminWorkflowGroup,
  deleteAdminNavLink,
  deleteAdminProofPoint,
  deleteAdminWorkflow,
  deleteAdminWorkflowGroup,
  getAdminWorkflowImageUrl,
  updateAdminNavLink,
  updateAdminProofPoint,
  updateAdminWorkflow,
  updateAdminWorkflowCanvas,
  updateAdminWorkflowGroup,
} from "@/lib/repositories/admin/site-content";
import { deleteUnreferencedStorageObject } from "@/lib/repositories/admin/media-cleanup";
import {
  navLinkSchema,
  proofPointSchema,
  workflowGroupSchema,
  workflowSchema,
} from "@/lib/validations/site-content";
import {
  MAX_WORKFLOW_CANVAS_CHARS,
  TOO_LARGE_MESSAGE,
  workflowCanvasInputSchema,
  workflowCanvasSchema,
} from "@/lib/validations/workflow-canvas";
import { prepareWorkflowCanvas } from "@/lib/workflow-canvas/prepare";

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

// ---------------------------------------------------------------------------
// Workflow canvas (pasted n8n JSON)
// ---------------------------------------------------------------------------

/**
 * The admin form for the canvas: the workflow it belongs to plus the raw paste.
 * `workflowCanvasInputSchema` owns the size cap and the parseability check, so
 * the limit lives in exactly one place.
 */
const workflowCanvasFormSchema = z.object({
  workflowId: z.string().min(1, "Missing workflow id."),
  source: workflowCanvasInputSchema,
  /** The portfolio title, used when sanitising empties the export's own name. */
  fallbackName: z.string().max(300).default(""),
});

/**
 * Turns a failed canvas write into something the admin can act on.
 *
 * Supabase hands back a plain PostgrestError object rather than an `Error`,
 * so the shared `errorMessage` helper would flatten every failure to the same
 * sentence. The one case worth naming is the canvas migration not having been
 * applied yet: the columns simply do not exist, which is a deploy step and not
 * a bad paste.
 *
 * The pasted export is never echoed. Only the curated sentences below are
 * returned, plus a database message that is first checked for any of the
 * paste's own text.
 */
function canvasErrorMessage(
  error: unknown,
  fallback: string,
  source: string,
): string {
  const asRecord =
    typeof error === "object" && error !== null
      ? (error as { message?: unknown; code?: unknown })
      : null;
  const raw =
    error instanceof Error
      ? error.message
      : typeof asRecord?.message === "string"
        ? asRecord.message
        : "";
  const code = typeof asRecord?.code === "string" ? asRecord.code : "";

  // 42703 = undefined_column, PGRST204 = column missing from the schema cache.
  const missingColumn =
    code === "42703" ||
    code === "PGRST204" ||
    (/canvas_(json|source)/.test(raw) &&
      /does not exist|schema cache|could not find/i.test(raw));
  if (missingColumn) {
    return "The canvas columns are not in the database yet — apply the workflow_canvas migration, then save again. Nothing was changed.";
  }

  if (!raw) return fallback;
  const sample = source.trim().slice(0, 40);
  if (sample && raw.includes(sample)) return fallback;
  return `${fallback} ${raw.slice(0, 300)}`;
}

/**
 * Saves a workflow's interactive canvas. An empty paste clears both columns.
 *
 * The admin editor parses the paste client-side for instant feedback, but that
 * result is never trusted: this action re-does the work server-side and only
 * what it produces here is persisted.
 *
 * The paste itself is never stored. Both canvas columns are readable with the
 * anon key, and a real n8n export carries client namespaces, colleagues' names
 * and the odd inbox or webhook URL, so `prepareWorkflowCanvas` sanitises first,
 * parses the sanitised object, and gates on a re-read of the exact strings
 * about to be written. `canvas_source` holds the sanitised export.
 */
export async function saveWorkflowCanvasAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();

  const rawSource = formString(formData, "canvasSource");
  // `workflowCanvasInputSchema` parses the paste as part of validating it, so an
  // oversized payload has to be turned away before it reaches the schema rather
  // than after — the client already short-circuits the same way.
  if (rawSource.length > MAX_WORKFLOW_CANVAS_CHARS) {
    return { ok: false, error: TOO_LARGE_MESSAGE };
  }

  const parsedForm = workflowCanvasFormSchema.safeParse({
    workflowId: formString(formData, "id"),
    source: rawSource,
    fallbackName: formString(formData, "canvasFallbackName"),
  });
  if (!parsedForm.success) {
    return { ok: false, error: firstZodError(parsedForm.error) };
  }

  const { workflowId, source, fallbackName } = parsedForm.data;
  const trimmed = source.trim();

  if (!trimmed) {
    try {
      await updateAdminWorkflowCanvas(workflowId, { canvas: null, source: null });
      revalidatePath("/");
      revalidatePath("/admin/workflows");
      return { ok: true, message: "Workflow canvas removed." };
    } catch (error) {
      return {
        ok: false,
        error: canvasErrorMessage(
          error,
          "Failed to remove the workflow canvas.",
          "",
        ),
      };
    }
  }

  // Authoritative run. The schema above only proved the text parses; this is the
  // sanitise → parse → leak-gate sequence whose output is stored.
  const prepared = prepareWorkflowCanvas(trimmed, { fallbackName });
  if (!prepared.ok) return { ok: false, error: prepared.error };

  const canvas = workflowCanvasSchema.safeParse(prepared.canvas);
  if (!canvas.success) return { ok: false, error: firstZodError(canvas.error) };

  // A payload with an empty `nodes` array parses successfully. Storing it would
  // leave the row reading as "has a canvas" while rendering nothing, so refuse
  // it here rather than writing an empty graph.
  if (canvas.data.nodes.length === 0) {
    return {
      ok: false,
      error: "That export parsed, but it has no nodes — there is nothing to show.",
    };
  }

  try {
    await updateAdminWorkflowCanvas(workflowId, {
      canvas: canvas.data,
      // The sanitised export, never the paste. Re-opening the editor prefills
      // from this column, so the admin sees exactly what is published.
      source: prepared.source,
    });
    revalidatePath("/");
    revalidatePath("/admin/workflows");
    return {
      ok: true,
      source: prepared.source,
      message: `Canvas saved — ${canvas.data.nodes.length} node${
        canvas.data.nodes.length === 1 ? "" : "s"
      }, ${canvas.data.edges.length} connection${
        canvas.data.edges.length === 1 ? "" : "s"
      }${
        prepared.replacements.length > 0
          ? `, ${prepared.replacements.length} identifying detail${
              prepared.replacements.length === 1 ? "" : "s"
            } removed before storing`
          : ""
      }.`,
    };
  } catch (error) {
    return {
      ok: false,
      error: canvasErrorMessage(
        error,
        "Failed to save the workflow canvas.",
        prepared.source,
      ),
    };
  }
}
