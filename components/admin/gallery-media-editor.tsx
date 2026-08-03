"use client";

import { useMemo, useState, useTransition } from "react";
import { uploadImageFileAction } from "@/lib/admin/actions/media";
import type { CaseStudyGalleryItem } from "@/lib/content/types";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-controls";

type GalleryMediaEditorProps = {
  name?: string;
  initialItems?: CaseStudyGalleryItem[];
};

export function GalleryMediaEditor({
  name = "galleryImagesJson",
  initialItems = [],
}: GalleryMediaEditorProps) {
  const [items, setItems] = useState<CaseStudyGalleryItem[]>(
    initialItems.length > 0
      ? initialItems
      : [{ url: "", caption: "Screenshot", alt: "" }],
  );
  const [error, setError] = useState<string | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const json = useMemo(() => JSON.stringify(items), [items]);

  function updateItem(index: number, patch: Partial<CaseStudyGalleryItem>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { url: "", caption: `Screenshot ${current.length + 1}`, alt: "" },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  function uploadAt(index: number, fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("bucket", "media");
    formData.set("file", file);

    setError(null);
    setPendingIndex(index);
    startTransition(async () => {
      const result = await uploadImageFileAction(formData);
      setPendingIndex(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.url) {
        updateItem(index, {
          url: result.url,
          alt: file.name.replace(/\.[^.]+$/, ""),
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={json} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
            Project gallery
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Upload screenshots for this project. They appear on the public case
            study page.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addItem}>
          Add image slot
        </Button>
      </div>

      <ul className="space-y-4">
        {items.map((item, index) => (
          <li
            key={`gallery-${index}`}
            className="space-y-3 rounded-lg border border-outline-variant/15 bg-surface-low p-4"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`gallery-caption-${index}`}>Caption</Label>
                <Input
                  id={`gallery-caption-${index}`}
                  value={item.caption}
                  onChange={(event) =>
                    updateItem(index, { caption: event.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`gallery-url-${index}`}>Image URL</Label>
                <Input
                  id={`gallery-url-${index}`}
                  value={item.url ?? ""}
                  onChange={(event) =>
                    updateItem(index, { url: event.target.value })
                  }
                  placeholder="Upload or paste URL"
                />
              </div>
            </div>

            {item.url ? (
              <div className="overflow-hidden rounded-lg border border-outline-variant/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt || item.caption}
                  className="max-h-44 w-full object-cover"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="block w-full max-w-md text-sm text-on-surface-variant file:mr-3 file:rounded-full file:border-0 file:bg-primary-container file:px-4 file:py-2 file:font-label file:text-on-primary-container"
                onChange={(event) => uploadAt(index, event.target.files)}
                disabled={pending}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
              >
                Remove
              </Button>
              {pending && pendingIndex === index ? (
                <span className="text-sm text-on-surface-variant">Uploading…</span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {error ? (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
