"use client";

import { useActionState } from "react";
import {
  deleteExperienceAction,
  saveExperienceAction,
} from "@/lib/admin/actions/experience";
import type { ActionResult } from "@/lib/admin/types";
import type { ExperienceRow } from "@/lib/supabase/database.types";
import { FormResult } from "@/components/admin/form-result";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form-controls";

function ExperienceEditor({ item }: { item?: ExperienceRow }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveExperienceAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4 panel-depth rounded-lg border border-outline-variant/10 bg-surface-container p-4">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <h3 className="font-heading text-lg text-on-surface">
        {item ? "Edit experience" : "Add experience"}
      </h3>
      <FormResult result={state} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`org-${item?.id ?? "new"}`}>Organization</Label>
          <Input
            id={`org-${item?.id ?? "new"}`}
            name="organization"
            required
            defaultValue={item?.organization ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`role-${item?.id ?? "new"}`}>Role</Label>
          <Input
            id={`role-${item?.id ?? "new"}`}
            name="role"
            required
            defaultValue={item?.role ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`loc-${item?.id ?? "new"}`}>Location</Label>
          <Input
            id={`loc-${item?.id ?? "new"}`}
            name="location"
            required
            defaultValue={item?.location ?? ""}
          />
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
        <div className="space-y-1.5">
          <Label htmlFor={`start-${item?.id ?? "new"}`}>Start date</Label>
          <Input
            id={`start-${item?.id ?? "new"}`}
            name="startDate"
            type="date"
            required
            defaultValue={item?.start_date ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`end-${item?.id ?? "new"}`}>End date</Label>
          <Input
            id={`end-${item?.id ?? "new"}`}
            name="endDate"
            type="date"
            defaultValue={item?.end_date ?? ""}
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isCurrent" defaultChecked={item?.is_current} />
          Current role
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
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : item ? "Update" : "Create"}
      </Button>
    </form>
  );
}

export function ExperienceManager({ items }: { items: ExperienceRow[] }) {
  return (
    <div className="space-y-8">
      <ExperienceEditor />
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={item.is_published ? "primary" : "neutral"}>
                {item.is_published ? "Published" : "Hidden"}
              </Badge>
              <form action={deleteExperienceAction}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" size="sm" variant="danger">
                  Delete
                </Button>
              </form>
            </div>
            <ExperienceEditor item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
