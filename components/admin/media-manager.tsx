"use client";

import { useActionState } from "react";
import {
  deleteMediaAction,
  setCvFromMediaAction,
  setPortraitFromMediaAction,
  uploadMediaAction,
} from "@/lib/admin/actions/media";
import type { ActionResult } from "@/lib/admin/types";
import type { StorageObjectItem } from "@/lib/repositories/admin/media";
import { FormResult } from "@/components/admin/form-result";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/form-controls";

type MediaManagerProps = {
  images: StorageObjectItem[];
  cvs: StorageObjectItem[];
  portraitUrl: string | null;
  cvUrl: string | null;
};

function UploadForm({
  bucket,
  label,
  accept,
  hint,
}: {
  bucket: "media" | "cv";
  label: string;
  accept: string;
  hint: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    uploadMediaAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="bucket" value={bucket} />
      <div className="space-y-1.5">
        <Label htmlFor={`${bucket}-file`}>{label}</Label>
        <input
          id={`${bucket}-file`}
          name="file"
          type="file"
          accept={accept}
          required
          className="block w-full text-sm text-on-surface-variant file:mr-3 file:rounded-full file:border-0 file:bg-primary-container file:px-4 file:py-2 file:font-label file:text-on-primary-container"
        />
        <p className="text-xs text-on-surface-variant">{hint}</p>
      </div>
      <FormResult result={state} />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Uploading…" : "Upload"}
      </Button>
    </form>
  );
}

function FileList({
  items,
  kind,
}: {
  items: StorageObjectItem[];
  kind: "image" | "cv";
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">No files uploaded yet.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={`${item.bucket}-${item.path}`}
          className="flex flex-col gap-3 border-b border-outline-variant/15 pb-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 space-y-1">
            {kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.publicUrl}
                alt={item.name}
                className="mb-2 h-20 w-20 rounded object-cover object-center"
              />
            ) : null}
            <p className="truncate font-label text-sm text-on-surface">{item.name}</p>
            <a
              href={item.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-xs text-primary hover:underline"
            >
              {item.publicUrl}
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            {kind === "image" ? (
              <form action={setPortraitFromMediaAction}>
                <input type="hidden" name="url" value={item.publicUrl} />
                <Button type="submit" size="sm" variant="outline">
                  Use as portrait
                </Button>
              </form>
            ) : (
              <form action={setCvFromMediaAction}>
                <input type="hidden" name="url" value={item.publicUrl} />
                <Button type="submit" size="sm" variant="outline">
                  Use as CV
                </Button>
              </form>
            )}
            <form action={deleteMediaAction}>
              <input type="hidden" name="bucket" value={item.bucket} />
              <input type="hidden" name="path" value={item.path} />
              <Button type="submit" size="sm" variant="ghost">
                Delete
              </Button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MediaManager({
  images,
  cvs,
  portraitUrl,
  cvUrl,
}: MediaManagerProps) {
  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h3 className="font-heading text-xl text-on-surface">Linked assets</h3>
        <p className="text-sm text-on-surface-variant">
          Portrait:{" "}
          {portraitUrl ? (
            <a href={portraitUrl} className="text-primary hover:underline">
              linked
            </a>
          ) : (
            "not set"
          )}
          {" · "}
          CV:{" "}
          {cvUrl ? (
            <a href={cvUrl} className="text-primary hover:underline">
              linked
            </a>
          ) : (
            "not set"
          )}
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-heading text-xl text-on-surface">Images</h3>
          <UploadForm
            bucket="media"
            label="Upload image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hint="JPEG, PNG, WebP, or GIF · max 5MB"
          />
          <FileList items={images} kind="image" />
        </div>
        <div className="space-y-4">
          <h3 className="font-heading text-xl text-on-surface">CV PDF</h3>
          <UploadForm
            bucket="cv"
            label="Upload CV"
            accept="application/pdf"
            hint="PDF only · max 10MB · auto-links to /resume"
          />
          <FileList items={cvs} kind="cv" />
        </div>
      </section>
    </div>
  );
}
