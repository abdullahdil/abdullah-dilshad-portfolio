"use client";

import { useActionState } from "react";
import {
  deleteCapabilityAction,
  saveCapabilityAction,
} from "@/lib/admin/actions/capabilities";
import type { ActionResult } from "@/lib/admin/types";
import type { CapabilityRow } from "@/lib/supabase/database.types";
import { FormResult } from "@/components/admin/form-result";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form-controls";

function CapabilityEditor({ item }: { item?: CapabilityRow }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveCapabilityAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-3 panel-depth rounded-lg border border-outline-variant/10 bg-surface-container p-4">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <FormResult result={state} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`cat-${item?.id ?? "new"}`}>Category</Label>
          <Input
            id={`cat-${item?.id ?? "new"}`}
            name="category"
            required
            defaultValue={item?.category ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`name-${item?.id ?? "new"}`}>Skill name</Label>
          <Input
            id={`name-${item?.id ?? "new"}`}
            name="name"
            required
            defaultValue={item?.name ?? ""}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`desc-${item?.id ?? "new"}`}>Description</Label>
          <Textarea
            id={`desc-${item?.id ?? "new"}`}
            name="description"
            rows={2}
            defaultValue={item?.description ?? ""}
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
        {pending ? "Saving…" : item ? "Update" : "Add skill"}
      </Button>
    </form>
  );
}

export function CapabilityManager({ items }: { items: CapabilityRow[] }) {
  return (
    <div className="space-y-6">
      <CapabilityEditor />
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={item.is_published ? "primary" : "neutral"}>
                {item.category}
              </Badge>
              <form action={deleteCapabilityAction}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" size="sm" variant="danger">
                  Delete
                </Button>
              </form>
            </div>
            <CapabilityEditor item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
