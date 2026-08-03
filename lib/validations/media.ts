import { z } from "zod";

export const MEDIA_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MEDIA_CV_MIME = ["application/pdf"] as const;

export const MEDIA_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const MEDIA_CV_MAX_BYTES = 10 * 1024 * 1024;

export const mediaBucketSchema = z.enum(["media", "cv"]);
export type MediaBucket = z.infer<typeof mediaBucketSchema>;

export function validateUploadFile(
  file: File,
  bucket: MediaBucket,
): { ok: true } | { ok: false; error: string } {
  if (!(file instanceof File) || file.size <= 0) {
    return { ok: false, error: "Choose a file to upload." };
  }

  if (bucket === "media") {
    if (!MEDIA_IMAGE_MIME.includes(file.type as (typeof MEDIA_IMAGE_MIME)[number])) {
      return { ok: false, error: "Images must be JPEG, PNG, WebP, or GIF." };
    }
    if (file.size > MEDIA_IMAGE_MAX_BYTES) {
      return { ok: false, error: "Images must be 5MB or smaller." };
    }
    return { ok: true };
  }

  if (!MEDIA_CV_MIME.includes(file.type as (typeof MEDIA_CV_MIME)[number])) {
    return { ok: false, error: "CV uploads must be PDF." };
  }
  if (file.size > MEDIA_CV_MAX_BYTES) {
    return { ok: false, error: "CV PDF must be 10MB or smaller." };
  }
  return { ok: true };
}

export function sanitizeStorageFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() || "file";
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return cleaned || "file";
}
