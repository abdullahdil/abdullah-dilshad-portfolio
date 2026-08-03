"use client";

import { useActionState } from "react";
import {
  createCaseStudyAction,
  updateCaseStudyAction,
} from "@/lib/admin/actions/case-studies";
import { arrayToLines } from "@/lib/admin/form-utils";
import type { ActionResult } from "@/lib/admin/types";
import type { CaseStudyInput } from "@/lib/validations/case-study";
import { FormResult } from "@/components/admin/form-result";
import { GalleryMediaEditor } from "@/components/admin/gallery-media-editor";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form-controls";

type CaseStudyFormProps = {
  mode: "create" | "edit";
  id?: string;
  initial: CaseStudyInput & {
    displayOrder?: number;
    isFeatured?: boolean;
  };
};

export function CaseStudyForm({ mode, id, initial }: CaseStudyFormProps) {
  const action = mode === "create" ? createCaseStudyAction : updateCaseStudyAction;
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="space-y-8">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <FormResult result={state} />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={initial.title} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            placeholder="auto-from-title"
            defaultValue={initial.slug}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={initial.status}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="accent">Accent</Label>
          <Select id="accent" name="accent" defaultValue={initial.accent}>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="tertiary">Tertiary</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="displayOrder">Display order</Label>
          <Input
            id="displayOrder"
            name="displayOrder"
            type="number"
            defaultValue={initial.displayOrder ?? 0}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="previewLabel">Preview label</Label>
          <Input
            id="previewLabel"
            name="previewLabel"
            defaultValue={initial.previewLabel}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-on-surface md:col-span-2">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={initial.isFeatured}
            className="rounded border-outline-variant"
          />
          Featured on homepage
        </label>
      </section>

      <section className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" name="summary" rows={3} required defaultValue={initial.summary} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="businessProblem">Business problem</Label>
          <Textarea
            id="businessProblem"
            name="businessProblem"
            rows={3}
            required
            defaultValue={initial.businessProblem}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="beforeState">Before state</Label>
          <Textarea
            id="beforeState"
            name="beforeState"
            rows={3}
            required
            defaultValue={initial.beforeState}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="beforeIssues">Before issues (one per line)</Label>
          <Textarea
            id="beforeIssues"
            name="beforeIssues"
            rows={4}
            required
            defaultValue={arrayToLines(initial.beforeIssues)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="architectureDescription">Architecture description</Label>
          <Textarea
            id="architectureDescription"
            name="architectureDescription"
            rows={4}
            required
            defaultValue={initial.architectureDescription}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="result">Result</Label>
          <Textarea id="result" name="result" rows={3} required defaultValue={initial.result} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contribution">Contribution (one per line)</Label>
          <Textarea
            id="contribution"
            name="contribution"
            rows={4}
            required
            defaultValue={arrayToLines(initial.contribution)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="demoVideoLabel">Demo video label</Label>
          <Input
            id="demoVideoLabel"
            name="demoVideoLabel"
            defaultValue={initial.demoVideoLabel}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="demoVideoUrl">Demo video URL (optional)</Label>
          <Input
            id="demoVideoUrl"
            name="demoVideoUrl"
            defaultValue={initial.demoVideoUrl ?? ""}
            placeholder="https://…"
          />
        </div>
      </section>

      <section className="space-y-4">
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
          Project media
        </p>
        <ImageUploadField
          name="featuredImageUrl"
          label="Featured / card image"
          initialUrl={initial.featuredImageUrl}
          hint="Shown on the homepage project card and as the project cover."
        />
        <GalleryMediaEditor
          initialItems={
            initial.galleryImages.length > 0
              ? initial.galleryImages
              : initial.galleryPlaceholders.map((caption) => ({
                  url: "",
                  caption,
                  alt: caption,
                }))
          }
        />
      </section>

      <section className="space-y-4">
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
          Nested JSON fields
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="architectureNodesJson">Architecture nodes JSON</Label>
          <Textarea
            id="architectureNodesJson"
            name="architectureNodesJson"
            rows={6}
            className="font-mono text-xs"
            required
            defaultValue={JSON.stringify(initial.architectureNodes, null, 2)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stepsJson">Steps JSON</Label>
          <Textarea
            id="stepsJson"
            name="stepsJson"
            rows={8}
            className="font-mono text-xs"
            required
            defaultValue={JSON.stringify(initial.steps, null, 2)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="toolsJson">Tools JSON</Label>
          <Textarea
            id="toolsJson"
            name="toolsJson"
            rows={6}
            className="font-mono text-xs"
            required
            defaultValue={JSON.stringify(initial.tools, null, 2)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reliabilityControlsJson">Reliability controls JSON</Label>
          <Textarea
            id="reliabilityControlsJson"
            name="reliabilityControlsJson"
            rows={6}
            className="font-mono text-xs"
            required
            defaultValue={JSON.stringify(initial.reliabilityControls, null, 2)}
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Create case study" : "Save changes"}
        </Button>
        <Button href="/admin/case-studies" variant="outline">
          Back to list
        </Button>
      </div>
    </form>
  );
}
