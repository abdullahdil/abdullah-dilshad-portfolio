import { deleteStorageObject } from "@/lib/repositories/admin/media";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { MediaBucket } from "@/lib/validations/media";

async function requireClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

/**
 * Splits a Supabase public storage URL into its bucket and object path.
 * Returns null for external URLs (or anything not served from our buckets),
 * which must never be deleted.
 */
export function parseStorageUrl(
  url: string,
): { bucket: MediaBucket; path: string } | null {
  const match = url.match(
    /\/storage\/v1\/object\/public\/(media|cv)\/(.+?)(?:\?.*)?$/,
  );
  if (!match) return null;

  const bucket = match[1] as MediaBucket;
  const path = decodeURIComponent(match[2]);
  if (!path || path.includes("..")) return null;
  return { bucket, path };
}

/**
 * Counts rows still pointing at this URL, so a shared image is never deleted
 * out from under another case study or workflow.
 */
async function countReferences(url: string): Promise<number> {
  const supabase = await requireClient();

  const [featured, gallery, workflows, profile] = await Promise.all([
    supabase
      .from("case_studies")
      .select("id", { count: "exact", head: true })
      .eq("featured_image_url", url),
    // Gallery uploads are persisted in external_url (see admin/case-studies).
    supabase
      .from("case_study_media")
      .select("id", { count: "exact", head: true })
      .or(`external_url.eq.${url},storage_path.eq.${url}`),
    supabase
      .from("workflows")
      .select("id", { count: "exact", head: true })
      .eq("image_url", url),
    supabase
      .from("profile")
      .select("id", { count: "exact", head: true })
      .or(`portrait_url.eq.${url},cv_url.eq.${url}`),
  ]);

  return (
    (featured.count ?? 0) +
    (gallery.count ?? 0) +
    (workflows.count ?? 0) +
    (profile.count ?? 0)
  );
}

/**
 * Deletes the stored file behind `url`, but only when it lives in our buckets
 * and no remaining row references it. Call this *after* clearing the reference.
 *
 * Returns what happened so callers can report it honestly instead of implying
 * a file was removed when it was still in use.
 */
export async function deleteUnreferencedStorageObject(
  url: string,
): Promise<{ deleted: boolean; reason?: string }> {
  if (!url) return { deleted: false, reason: "No image was attached." };

  const parsed = parseStorageUrl(url);
  if (!parsed) {
    return {
      deleted: false,
      reason: "Image is hosted externally, so only the link was removed.",
    };
  }

  const references = await countReferences(url);
  if (references > 0) {
    return {
      deleted: false,
      reason: `Link removed. The file is kept because ${references} other item(s) still use it.`,
    };
  }

  await deleteStorageObject(parsed.bucket, parsed.path);
  return { deleted: true };
}

/**
 * Every image URL a case study currently points at (featured + gallery).
 * Used to work out which files a save or delete orphaned.
 */
export async function listCaseStudyImageUrls(
  caseStudyId: string,
): Promise<string[]> {
  const supabase = await requireClient();

  const [study, media] = await Promise.all([
    supabase
      .from("case_studies")
      .select("featured_image_url")
      .eq("id", caseStudyId)
      .maybeSingle(),
    supabase
      .from("case_study_media")
      .select("external_url,storage_path")
      .eq("case_study_id", caseStudyId),
  ]);

  const urls = new Set<string>();
  const featured = study.data?.featured_image_url as string | null | undefined;
  if (featured) urls.add(featured);

  for (const row of media.data ?? []) {
    const external = (row as { external_url: string | null }).external_url;
    const stored = (row as { storage_path: string | null }).storage_path;
    if (external) urls.add(external);
    if (stored) urls.add(stored);
  }

  return [...urls];
}

/**
 * Deletes files that were dropped between `before` and `after`, skipping any
 * still referenced elsewhere. Never throws — cleanup must not fail a save.
 */
export async function cleanUpRemovedImages(
  before: string[],
  after: string[],
): Promise<void> {
  const kept = new Set(after);
  for (const url of before) {
    if (kept.has(url)) continue;
    try {
      await deleteUnreferencedStorageObject(url);
    } catch {
      // A stray file is not worth failing the surrounding mutation.
    }
  }
}
