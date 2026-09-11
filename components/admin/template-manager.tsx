"use client";

import { useActionState } from "react";
import {
  deleteTemplateAction,
  saveTemplateAction,
} from "@/lib/admin/actions/templates";
import { arrayToLines } from "@/lib/admin/form-utils";
import type { ActionResult } from "@/lib/admin/types";
import type { PublicTemplateRow } from "@/lib/supabase/database.types";
import { FormResult } from "@/components/admin/form-result";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form-controls";

function TemplateEditor({ item }: { item?: PublicTemplateRow }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveTemplateAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-3 panel-depth rounded-lg border border-outline-variant/10 bg-surface-container p-4">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <FormResult result={state} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`title-${item?.id ?? "new"}`}>Title</Label>
          <Input
            id={`title-${item?.id ?? "new"}`}
            name="title"
            required
            defaultValue={item?.title ?? ""}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`desc-${item?.id ?? "new"}`}>Description</Label>
          <Textarea
            id={`desc-${item?.id ?? "new"}`}
            name="description"
            rows={3}
            required
            defaultValue={item?.description ?? ""}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`url-${item?.id ?? "new"}`}>External URL</Label>
          <Input
            id={`url-${item?.id ?? "new"}`}
            name="externalUrl"
            type="url"
            required
            defaultValue={item?.external_url ?? ""}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`tools-${item?.id ?? "new"}`}>Tools (one per line)</Label>
          <Textarea
            id={`tools-${item?.id ?? "new"}`}
            name="tools"
            rows={3}
            required
            defaultValue={arrayToLines(item?.tools ?? [])}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`accent-${item?.id ?? "new"}`}>Accent</Label>
          <Select
            id={`accent-${item?.id ?? "new"}`}
            name="accent"
            defaultValue={item?.accent ?? "primary"}
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="tertiary">Tertiary</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`order-${item?.id ?? "new"}`}>Display order</Label>
          <Input
            id={`order-${item?.id ?? "new"}`}
            name="displayOrder"
            type="number"
            defaultValue={item?.display_order ?? 0}
          />
        </div>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={item?.is_published ?? true}
          />
          Published
        </label>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : item ? "Update" : "Add template"}
      </Button>
    </form>
  );
}

export function TemplateManager({ items }: { items: PublicTemplateRow[] }) {
  return (
    <div className="space-y-6">
      <TemplateManagerCreate />
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={item.is_published ? "primary" : "neutral"}>
                {item.is_published ? "Published" : "Hidden"}
              </Badge>
              <form action={deleteTemplateAction}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" size="sm" variant="danger">
                  Delete
                </Button>
              </form>
            </div>
            <TemplateEditor item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplateManagerCreate() {
  return <TemplateEditor />;
}
