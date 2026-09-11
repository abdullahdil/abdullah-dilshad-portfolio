"use client";

import { useActionState } from "react";
import {
  deleteHeroWorkflowStepAction,
  saveHeroWorkflowStepAction,
} from "@/lib/admin/actions/site-content";
import type { ActionResult } from "@/lib/admin/types";
import type { HeroWorkflowStepRow } from "@/lib/supabase/database.types";
import { heroWorkflowIcons } from "@/lib/validations/site-content";
import { FormResult } from "@/components/admin/form-result";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form-controls";

function HeroWorkflowStepEditor({ item }: { item?: HeroWorkflowStepRow }) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(saveHeroWorkflowStepAction, null);
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
          <Label htmlFor={`title-${key}`}>Step title</Label>
          <Input
            id={`title-${key}`}
            name="title"
            required
            placeholder="Business Trigger"
            defaultValue={item?.title ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`icon-${key}`}>Icon</Label>
          <Select
            id={`icon-${key}`}
            name="icon"
            defaultValue={item?.icon ?? "Webhook"}
          >
            {heroWorkflowIcons.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`desc-${key}`}>Description</Label>
          <Textarea
            id={`desc-${key}`}
            name="description"
            rows={2}
            placeholder="Scheduled or event-driven start"
            defaultValue={item?.description ?? ""}
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
        {pending ? "Saving…" : item ? "Update" : "Add step"}
      </Button>
    </form>
  );
}

export function HeroWorkflowManager({
  items,
}: {
  items: HeroWorkflowStepRow[];
}) {
  return (
    <div className="space-y-6">
      <HeroWorkflowStepEditor />
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={item.is_published ? "primary" : "neutral"}>
                {item.title}
              </Badge>
              <span className="text-xs text-on-surface-variant">{item.icon}</span>
              <form action={deleteHeroWorkflowStepAction}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" size="sm" variant="danger">
                  Delete
                </Button>
              </form>
            </div>
            <HeroWorkflowStepEditor item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
