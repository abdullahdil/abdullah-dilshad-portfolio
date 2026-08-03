import { MediaManager } from "@/components/admin/media-manager";
import {
  listStorageObjects,
  type StorageObjectItem,
} from "@/lib/repositories/admin/media";
import { getAdminProfile } from "@/lib/repositories/admin/profile";

export const metadata = { title: "Media" };

export default async function AdminMediaPage() {
  let images: StorageObjectItem[] = [];
  let cvs: StorageObjectItem[] = [];
  let portraitUrl: string | null = null;
  let cvUrl: string | null = null;
  let error: string | null = null;

  try {
    const [imageList, cvList, profile] = await Promise.all([
      listStorageObjects("media"),
      listStorageObjects("cv"),
      getAdminProfile(),
    ]);
    images = imageList;
    cvs = cvList;
    portraitUrl = profile?.portrait_url ?? null;
    cvUrl = profile?.cv_url ?? null;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load media library.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">Media</h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Central library for images and CV PDFs. You can also upload directly on
          Profile (portrait) and each Case Study editor (featured + gallery).
        </p>
      </div>
      {error ? (
        <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      ) : (
        <MediaManager
          images={images}
          cvs={cvs}
          portraitUrl={portraitUrl}
          cvUrl={cvUrl}
        />
      )}
    </div>
  );
}
