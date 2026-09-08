"use client";

import { useActionState } from "react";
import {
  deleteWorkflowAction,
  deleteWorkflowGroupAction,
  deleteWorkflowImageAction,
  saveWorkflowAction,
  saveWorkflowGroupAction,
} from "@/lib/admin/actions/site-content";
import type { ActionResult } from "@/lib/admin/types";
import type {
  WorkflowGroupRow,
  WorkflowRow,
} from "@/lib/supabase/database.types";
import { FormResult } from "@/components/admin/form-result";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form-controls";

function GroupEditor({ item }: { item?: WorkflowGroupRow }) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(saveWorkflowGroupAction, null);
  const key = item?.id ?? "new";

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-lg border border-outline-variant/10 bg-surface-container p-4"
    >
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <FormResult result={state} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`category-${key}`}>Category name</Label>
          <Input
            id={`category-${key}`}
            name="category"
            required
            placeholder="Lead Generation & Outreach"
            defaultValue={item?.category ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`gorder-${key}`}>Display order</Label>
          <Input
            id={`gorder-${key}`}
            name="displayOrder"
            type="number"
            defaultValue={item?.display_order ?? 0}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`gdesc-${key}`}>Category description</Label>
          <Textarea
            id={`gdesc-${key}`}
            name="description"
            rows={2}
            defaultValue={item?.description ?? ""}
          />
        </div>
        <label className="flex items-center gap-2 self-end text-sm">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={item?.is_published ?? true}
          />
          Published
        </label>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : item ? "Update category" : "Add category"}
      </Button>
    </form>
  );
}

function WorkflowImageRemover({ item }: { item: WorkflowRow }) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(deleteWorkflowImageAction, null);

  if (!item.image_url) return null;

  return (
    <div className="space-y-1">
      <form action={formAction}>
        <input type="hidden" name="id" value={item.id} />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Removing…" : "Remove image"}
        </Button>
      </form>
      <FormResult result={state} />
    </div>
  );
}

function WorkflowEditor({
  groups,
  groupId,
  item,
}: {
  groups: WorkflowGroupRow[];
  groupId?: string;
  item?: WorkflowRow;
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(saveWorkflowAction, null);
  const key = item?.id ?? `new-${groupId ?? "any"}`;

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-lg border border-outline-variant/10 bg-surface-container p-4"
    >
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <FormResult result={state} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`wtitle-${key}`}>Workflow title</Label>
          <Input
            id={`wtitle-${key}`}
            name="title"
            required
            placeholder="Prospect Discovery Engine"
            defaultValue={item?.title ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`wgroup-${key}`}>Category</Label>
          <Select
            id={`wgroup-${key}`}
            name="groupId"
            required
            defaultValue={item?.group_id ?? groupId ?? ""}
          >
            <option value="">Select a category…</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.category}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`wslug-${key}`}>Slug</Label>
          <Input
            id={`wslug-${key}`}
            name="slug"
            required
            placeholder="prospect-discovery-engine"
            defaultValue={item?.slug ?? ""}
          />
          <p className="text-xs text-on-surface-variant">
            Also seeds each card&apos;s generated diagram — changing it changes
            the artwork.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`wtags-${key}`}>Outcome tags</Label>
          <Input
            id={`wtags-${key}`}
            name="outcomeTags"
            placeholder="Lead gen, Pipeline"
            defaultValue={(item?.outcome_tags ?? []).join(", ")}
          />
          <p className="text-xs text-on-surface-variant">
            Comma-separated, up to 8.
          </p>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`wsummary-${key}`}>Summary</Label>
          <Textarea
            id={`wsummary-${key}`}
            name="summary"
            rows={3}
            defaultValue={item?.summary ?? ""}
          />
        </div>
        <div className="space-y-3 md:col-span-2">
          <ImageUploadField
            name="imageUrl"
            label="Workflow image"
            initialUrl={item?.image_url ?? ""}
            hint="JPEG, PNG, WebP, or GIF · max 5MB · replaces the generated diagram on the public card"
          />
          <div className="space-y-1.5">
            <Label htmlFor={`walt-${key}`}>Image alt text</Label>
            <Input
              id={`walt-${key}`}
              name="imageAlt"
              placeholder="Describe the image for screen readers"
              defaultValue={item?.image_alt ?? ""}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`worder-${key}`}>Display order</Label>
          <Input
            id={`worder-${key}`}
            name="displayOrder"
            type="number"
            defaultValue={item?.display_order ?? 0}
          />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={item?.is_active ?? true}
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={item?.is_published ?? true}
            />
            Published
          </label>
        </div>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : item ? "Update workflow" : "Add workflow"}
      </Button>
    </form>
  );
}

export function WorkflowManager({
  groups,
  workflows,
}: {
  groups: WorkflowGroupRow[];
  workflows: WorkflowRow[];
}) {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h3 className="font-heading text-title-lg text-on-surface">
          New category
        </h3>
        <GroupEditor />
      </section>

      <section className="space-y-4">
        <h3 className="font-heading text-title-lg text-on-surface">
          New workflow
        </h3>
        {groups.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Add a category first — every workflow belongs to one.
          </p>
        ) : (
          <WorkflowEditor groups={groups} />
        )}
      </section>

      <div className="space-y-10">
        {groups.map((group) => {
          const items = workflows.filter((row) => row.group_id === group.id);

          return (
            <section key={group.id} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={group.is_published ? "primary" : "neutral"}>
                  {group.category}
                </Badge>
                <span className="text-xs text-on-surface-variant">
                  {items.length} workflow{items.length === 1 ? "" : "s"}
                </span>
                <form action={deleteWorkflowGroupAction}>
                  <input type="hidden" name="id" value={group.id} />
                  <Button type="submit" size="sm" variant="danger">
                    Delete category + its workflows
                  </Button>
                </form>
              </div>

              <GroupEditor item={group} />

              <div className="space-y-3 border-l border-outline-variant/20 pl-4">
                {items.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-on-surface">
                        {item.title}
                      </span>
                      {item.is_published ? null : (
                        <Badge tone="neutral">Draft</Badge>
                      )}
                      {item.is_active ? null : (
                        <Badge tone="neutral">Inactive</Badge>
                      )}
                      <WorkflowImageRemover item={item} />
                      <form action={deleteWorkflowAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <Button type="submit" size="sm" variant="danger">
                          Delete
                        </Button>
                      </form>
                    </div>
                    <WorkflowEditor
                      groups={groups}
                      groupId={group.id}
                      item={item}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
