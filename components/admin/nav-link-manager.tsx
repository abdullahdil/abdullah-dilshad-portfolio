"use client";

import { useActionState } from "react";
import {
  deleteNavLinkAction,
  saveNavLinkAction,
} from "@/lib/admin/actions/site-content";
import type { ActionResult } from "@/lib/admin/types";
import type { NavLinkRow } from "@/lib/supabase/database.types";
import { FormResult } from "@/components/admin/form-result";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-controls";

function NavLinkEditor({ item }: { item?: NavLinkRow }) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(saveNavLinkAction, null);
  const key = item?.id ?? "new";

  return (
    <form
      action={formAction}
      className="space-y-3 panel-depth rounded-lg border border-outline-variant/10 bg-surface-container p-4"
    >
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <FormResult result={state} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`label-${key}`}>Label</Label>
          <Input
            id={`label-${key}`}
            name="label"
            required
            placeholder="Work"
            defaultValue={item?.label ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`href-${key}`}>Link target</Label>
          <Input
            id={`href-${key}`}
            name="href"
            required
            placeholder="/#work"
            defaultValue={item?.href ?? ""}
          />
          <p className="text-xs text-on-surface-variant">
            Section anchor (<code>/#work</code>), internal route (
            <code>/resume</code>) or full https:// URL.
          </p>
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
        {pending ? "Saving…" : item ? "Update" : "Add link"}
      </Button>
    </form>
  );
}

export function NavLinkManager({ items }: { items: NavLinkRow[] }) {
  return (
    <div className="space-y-6">
      <NavLinkEditor />
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={item.is_published ? "primary" : "neutral"}>
                {item.label}
              </Badge>
              <span className="text-xs text-on-surface-variant">{item.href}</span>
              <form action={deleteNavLinkAction}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" size="sm" variant="danger">
                  Delete
                </Button>
              </form>
            </div>
            <NavLinkEditor item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
