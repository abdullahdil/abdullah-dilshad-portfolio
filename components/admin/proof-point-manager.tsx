"use client";

import { useActionState } from "react";
import {
  deleteProofPointAction,
  saveProofPointAction,
} from "@/lib/admin/actions/site-content";
import type { ActionResult } from "@/lib/admin/types";
import type { ProofPointRow } from "@/lib/supabase/database.types";
import { FormResult } from "@/components/admin/form-result";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-controls";

function ProofPointEditor({ item }: { item?: ProofPointRow }) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(saveProofPointAction, null);
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
          <Label htmlFor={`value-${key}`}>Headline value</Label>
          <Input
            id={`value-${key}`}
            name="value"
            required
            placeholder="25+ workflows"
            defaultValue={item?.value ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`label-${key}`}>Supporting label</Label>
          <Input
            id={`label-${key}`}
            name="label"
            required
            placeholder="Paid production automations delivered"
            defaultValue={item?.label ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`order-${key}`}>Display order</Label>
          <Input
            id={`order-${key}`}
            name="displayOrder"
            type="number"
            defaultValue={item?.display_order ?? 0}
          />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={item?.is_featured ?? false}
            />
            Featured (spans full width)
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
        {pending ? "Saving…" : item ? "Update" : "Add proof point"}
      </Button>
    </form>
  );
}

export function ProofPointManager({ items }: { items: ProofPointRow[] }) {
  return (
    <div className="space-y-6">
      <ProofPointEditor />
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={item.is_published ? "primary" : "neutral"}>
                {item.value}
              </Badge>
              {item.is_featured ? <Badge tone="secondary">Featured</Badge> : null}
              <form action={deleteProofPointAction}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" size="sm" variant="danger">
                  Delete
                </Button>
              </form>
            </div>
            <ProofPointEditor item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
