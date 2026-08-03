"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/lib/admin/actions/settings";
import type { ActionResult } from "@/lib/admin/types";
import type { SiteSettingsInput } from "@/lib/validations/settings";
import { FormResult } from "@/components/admin/form-result";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form-controls";

export function SettingsForm({ initial }: { initial: SiteSettingsInput }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateSettingsAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <FormResult result={state} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="availabilityStatus">Availability status</Label>
          <Select
            id="availabilityStatus"
            name="availabilityStatus"
            defaultValue={initial.availabilityStatus}
          >
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="unavailable">Unavailable</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="availabilityLabel">Availability label</Label>
          <Input
            id="availabilityLabel"
            name="availabilityLabel"
            required
            defaultValue={initial.availabilityLabel}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="responseTimeNote">Response time note</Label>
          <Input
            id="responseTimeNote"
            name="responseTimeNote"
            defaultValue={initial.responseTimeNote}
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="footerNote">Footer note</Label>
          <Textarea
            id="footerNote"
            name="footerNote"
            rows={2}
            defaultValue={initial.footerNote}
          />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
