"use client";

import { useActionState } from "react";
import { submitContactAction } from "@/lib/contact/actions";
import type { ActionResult } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form-controls";
import { contactOpportunityTypes } from "@/lib/content/seed";

type ContactFormProps = {
  contactEmail: string;
};

export function ContactForm({ contactEmail }: ContactFormProps) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitContactAction,
    null,
  );

  return (
    <form className="relative space-y-6" action={formAction} noValidate>
      <div className="space-y-1">
        <Label htmlFor="contact-name">Full Name</Label>
        <Input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          required
          disabled={pending || state?.ok === true}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="contact-email">Work Email</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="john@company.com"
          required
          disabled={pending || state?.ok === true}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="contact-company">
          Company <span className="normal-case tracking-normal opacity-70">(optional)</span>
        </Label>
        <Input
          id="contact-company"
          name="company"
          type="text"
          autoComplete="organization"
          placeholder="Company name"
          disabled={pending || state?.ok === true}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="contact-opportunity">Opportunity type</Label>
        <Select
          id="contact-opportunity"
          name="opportunity_type"
          defaultValue={contactOpportunityTypes[0]}
          required
          disabled={pending || state?.ok === true}
        >
          {contactOpportunityTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="contact-message">What&apos;s the bottleneck?</Label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder="Describe the manual workflow you want to automate..."
          rows={4}
          required
          disabled={pending || state?.ok === true}
        />
      </div>

      <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden>
        <Label htmlFor="company_website">Company website</Label>
        <Input
          id="company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state?.ok ? (
        <div
          className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-body-md text-on-surface"
          role="status"
        >
          {state.message ?? "Thanks — I will follow up shortly."}
        </div>
      ) : null}

      {state && !state.ok ? (
        <div
          className="rounded-lg border border-error/30 bg-error/10 p-4 text-body-md text-error"
          role="alert"
        >
          {state.error} You can also email{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="font-semibold underline hover:no-underline"
          >
            {contactEmail}
          </a>
          .
        </div>
      ) : null}

      {state?.ok !== true ? (
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
      ) : null}
    </form>
  );
}
