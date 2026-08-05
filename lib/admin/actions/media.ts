"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/admin/types";
import { requireAuthorizedAdmin } from "@/lib/auth/session";
import {
  deleteStorageObject,
  setProfileAssetUrl,
  uploadStorageObject,
} from "@/lib/repositories/admin/media";
import {
  mediaBucketSchema,
  validateUploadFile,
} from "@/lib/validations/media";

function revalidateMediaPaths() {
  // Keep admin uploads snappy — only touch surfaces that display media.
  revalidatePath("/admin/media");
  revalidatePath("/admin/profile");
  revalidatePath("/");
  revalidatePath("/resume");
}

export async function uploadMediaAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuthorizedAdmin();

  const bucketParsed = mediaBucketSchema.safeParse(formData.get("bucket"));
  if (!bucketParsed.success) {
    return { ok: false, error: "Invalid storage bucket." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Choose a file to upload." };
  }

  const valid = validateUploadFile(file, bucketParsed.data);
  if (!valid.ok) return valid;

  try {
    const uploaded = await uploadStorageObject(bucketParsed.data, file);

    if (bucketParsed.data === "cv") {
      await setProfileAssetUrl("cv", uploaded.publicUrl);
    }

    revalidateMediaPaths();
    return {
      ok: true,
      url: uploaded.publicUrl,
      message:
        bucketParsed.data === "cv"
          ? "CV uploaded and linked on the resume page."
          : `Uploaded ${uploaded.name}`,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed.",
    };
  }
}

/** Upload an image and return its public URL (for profile / case-study pickers). */
export async function uploadImageFileAction(formData: FormData): Promise<ActionResult> {
  return uploadMediaAction(null, formData);
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  const bucketParsed = mediaBucketSchema.safeParse(formData.get("bucket"));
  const path = String(formData.get("path") ?? "");
  if (!bucketParsed.success || !path) return;

  await deleteStorageObject(bucketParsed.data, path);
  revalidateMediaPaths();
}

export async function setPortraitFromMediaAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  const url = String(formData.get("url") ?? "");
  if (!url.startsWith("http")) return;

  await setProfileAssetUrl("portrait", url);
  revalidateMediaPaths();
}

export async function setCvFromMediaAction(formData: FormData): Promise<void> {
  await requireAuthorizedAdmin();
  const url = String(formData.get("url") ?? "");
  if (!url.startsWith("http")) return;

  await setProfileAssetUrl("cv", url);
  revalidateMediaPaths();
}
