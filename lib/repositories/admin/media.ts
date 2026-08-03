import { randomBytes } from "crypto";
import {
  getAdminProfile,
  upsertAdminProfile,
} from "@/lib/repositories/admin/profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { MediaBucket } from "@/lib/validations/media";
import { sanitizeStorageFileName } from "@/lib/validations/media";

export type StorageObjectItem = {
  bucket: MediaBucket;
  path: string;
  name: string;
  publicUrl: string;
  updatedAt: string | null;
  size: number | null;
};

async function requireClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

function publicUrl(
  supabase: Awaited<ReturnType<typeof requireClient>>,
  bucket: MediaBucket,
  path: string,
) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function listStorageObjects(
  bucket: MediaBucket,
): Promise<StorageObjectItem[]> {
  const supabase = await requireClient();
  const { data, error } = await supabase.storage.from(bucket).list("", {
    limit: 100,
    sortBy: { column: "updated_at", order: "desc" },
  });
  if (error) throw error;

  return (data ?? [])
    .filter((item) => item.name && !item.name.endsWith("/"))
    .map((item) => ({
      bucket,
      path: item.name,
      name: item.name,
      publicUrl: publicUrl(supabase, bucket, item.name),
      updatedAt: item.updated_at ?? null,
      size: item.metadata?.size ?? null,
    }));
}

export async function uploadStorageObject(
  bucket: MediaBucket,
  file: File,
): Promise<StorageObjectItem> {
  const supabase = await requireClient();
  const safeName = sanitizeStorageFileName(file.name);
  const path = `${Date.now()}-${randomBytes(4).toString("hex")}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  return {
    bucket,
    path,
    name: path,
    publicUrl: publicUrl(supabase, bucket, path),
    updatedAt: new Date().toISOString(),
    size: file.size,
  };
}

export async function deleteStorageObject(
  bucket: MediaBucket,
  path: string,
): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export async function setProfileAssetUrl(
  kind: "cv" | "portrait",
  url: string,
): Promise<void> {
  const profile = await getAdminProfile();
  if (!profile) {
    throw new Error("Save the profile once before attaching media URLs.");
  }

  await upsertAdminProfile({
    fullName: profile.full_name,
    professionalTitle: profile.professional_title,
    heroHeadline: profile.hero_headline,
    heroDescription: profile.hero_description,
    shortBio: profile.short_bio,
    longBio: profile.long_bio,
    location: profile.location,
    availabilityStatus: profile.availability_status,
    availabilityLabel: profile.availability_label,
    email: profile.email,
    linkedinUrl: profile.linkedin_url ?? "",
    githubUrl: profile.github_url ?? "",
    n8nProfileUrl: profile.n8n_profile_url ?? "",
    credentialUrl: profile.credential_url ?? "",
    cvUrl: kind === "cv" ? url : profile.cv_url ?? "",
    portraitUrl: kind === "portrait" ? url : profile.portrait_url ?? "",
  });
}
