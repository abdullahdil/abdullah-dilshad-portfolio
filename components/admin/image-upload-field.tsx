"use client";

import { useId, useState, useTransition } from "react";
import { uploadImageFileAction } from "@/lib/admin/actions/media";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-controls";

type ImageUploadFieldProps = {
  name: string;
  label: string;
  initialUrl?: string | null;
  hint?: string;
};

export function ImageUploadField({
  name,
  label,
  initialUrl = "",
  hint = "JPEG, PNG, WebP, or GIF · max 5MB",
}: ImageUploadFieldProps) {
  const inputId = useId();
  const fileId = useId();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("bucket", "media");
    formData.set("file", file);

    setError(null);
    startTransition(async () => {
      const result = await uploadImageFileAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.url) setUrl(result.url);
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-outline-variant/15 bg-surface-low p-4">
      <div className="space-y-1.5">
        <Label htmlFor={inputId}>{label}</Label>
        <Input
          id={inputId}
          name={name}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://… or upload below"
        />
        <p className="text-xs text-on-surface-variant">{hint}</p>
      </div>

      {url ? (
        <div className="relative aspect-square max-w-xs overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-highest">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`${label} preview`}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <input
          id={fileId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="block w-full max-w-md text-sm text-on-surface-variant file:mr-3 file:rounded-full file:border-0 file:bg-primary-container file:px-4 file:py-2 file:font-label file:text-on-primary-container"
          onChange={(event) => onFileChange(event.target.files)}
          disabled={pending}
        />
        {url ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setUrl("")}
            disabled={pending}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {pending ? (
        <p className="text-sm text-on-surface-variant">Uploading…</p>
      ) : null}
      {error ? (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
