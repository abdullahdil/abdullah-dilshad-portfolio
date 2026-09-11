"use client";

import { useActionState } from "react";
import { submitContactAction } from "@/lib/contact/actions";
import type { ActionResult } from "@/lib/admin/types";
import {
  Button,
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import { contactOpportunityTypes } from "@/lib/content/seed";

type ContactFormProps = {
  contactEmail: string;
};

const ERROR_ID = "contact-form-error";

export function ContactForm({ contactEmail }: ContactFormProps) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitContactAction,
    null,
  );

  const sent = state?.ok === true;
  const locked = pending || sent;

  return (
    <form className="relative" action={formAction} noValidate>
      {/* The form is the page's closing action — it gets the raised panel. */}
      <div className="panel panel-depth">
        <div className="border-b border-outline-variant px-6 py-4">
          <span className="font-label text-on-surface-faint">Send a message</span>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Full Name</Label>
              <Input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                required
                disabled={locked}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Work Email</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="john@company.com"
                required
                disabled={locked}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact-company">
                Company{" "}
                <span className="normal-case tracking-normal opacity-70">
                  (optional)
                </span>
              </Label>
              <Input
                id="contact-company"
                name="company"
                type="text"
                autoComplete="organization"
                placeholder="Company name"
                disabled={locked}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-opportunity">Opportunity type</Label>
              <Select
                id="contact-opportunity"
                name="opportunity_type"
                defaultValue={contactOpportunityTypes[0]}
                required
                disabled={locked}
              >
                {contactOpportunityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-message">What&apos;s the bottleneck?</Label>
            <Textarea
              id="contact-message"
              name="message"
              placeholder="Describe the manual workflow you want to automate..."
              rows={5}
              required
              disabled={locked}
            />
          </div>
        </div>

        {/* Honeypot — must stay in the DOM; the server action reads `company_website`. */}
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

        <div className="border-t border-outline-variant px-6 py-5">
          <div aria-live="polite">
            {sent ? (
              <p
                className="mb-4 rounded-lg border border-outline-variant bg-accent-soft px-4 py-3 text-body-sm text-on-surface"
                role="status"
              >
                {state?.ok ? state.message ?? "Thanks — I will follow up shortly." : null}
              </p>
            ) : null}

            {state && !state.ok ? (
              <div className="mb-4 rounded-lg border border-error/40 bg-error/10 px-4 py-3">
                <FieldError id={ERROR_ID}>
                  <>
                    {state.error} You can also email{" "}
                    <a
                      href={`mailto:${contactEmail}`}
                      className="font-medium underline hover:no-underline"
                    >
                      {contactEmail}
                    </a>
                    .
                  </>
                </FieldError>
              </div>
            ) : null}
          </div>

          {sent ? null : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                disabled={pending}
                aria-describedby={state && !state.ok ? ERROR_ID : undefined}
              >
                {pending ? "Sending…" : "Send message"}
              </Button>
              <p className="text-body-sm text-on-surface-faint">
                Or email{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="link-underline text-on-surface-variant hover:text-accent"
                >
                  {contactEmail}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
