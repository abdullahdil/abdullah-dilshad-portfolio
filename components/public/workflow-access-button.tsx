"use client";

import { useActionState, useId, useState } from "react";
import { KeyRound } from "lucide-react";
import { requestWorkflowAccessAction } from "@/lib/workflow-access/actions";
import type { ActionResult } from "@/lib/admin/types";
import {
  Button,
  Dialog,
  FieldError,
  Input,
  Label,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type WorkflowAccessButtonProps = {
  workflowId: string;
  workflowTitle: string;
  className?: string;
};

export function WorkflowAccessButton({
  workflowId,
  workflowTitle,
  className,
}: WorkflowAccessButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    requestWorkflowAccessAction,
    null,
  );

  // Several of these render on one page — every id must be instance-scoped.
  const uid = useId();
  const nameId = `${uid}-name`;
  const emailId = `${uid}-email`;
  const companyId = `${uid}-company`;
  const noteId = `${uid}-note`;
  const honeypotId = `${uid}-company-website`;
  const errorId = `${uid}-error`;

  const sent = state?.ok === true;
  const locked = pending || sent;

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className={cn("lift", className)}
        // The row itself is not interactive today, but guard anyway so this
        // button can never trigger a future row-level click handler.
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        aria-haspopup="dialog"
      >
        <KeyRound className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Request access
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Request access: ${workflowTitle}`}
      >
        <p className="text-body-sm text-pretty text-on-surface-variant">
          The workflow export is not published on this site. Leave your details and
          I&apos;ll email you the file myself. No account needed.
        </p>

        <form className="relative mt-5" action={formAction} noValidate>
          <input type="hidden" name="workflow_id" value={workflowId} />
          <input type="hidden" name="workflow_title" value={workflowTitle} />

          {/* Honeypot — must stay in the DOM; the server action reads `company_website`. */}
          <div
            className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden"
            aria-hidden
          >
            <Label htmlFor={honeypotId}>Company website</Label>
            <Input
              id={honeypotId}
              name="company_website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div aria-live="polite">
            {sent ? (
              <p
                className="rounded-lg border border-outline-variant bg-accent-soft px-4 py-3 text-body-sm text-on-surface"
                role="status"
              >
                {(state?.ok ? state.message : null) ??
                  "Request received. I'll email the workflow export to you."}
              </p>
            ) : null}

            {state && !state.ok ? (
              <div className="mb-4 rounded-lg border border-error/40 bg-error/10 px-4 py-3">
                <FieldError id={errorId}>{state.error}</FieldError>
              </div>
            ) : null}
          </div>

          {sent ? null : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={nameId}>Full name</Label>
                  <Input
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    required
                    disabled={locked}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={emailId}>Work email</Label>
                  <Input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="john@company.com"
                    required
                    disabled={locked}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={companyId}>
                  Company{" "}
                  <span className="normal-case tracking-normal opacity-70">
                    (optional)
                  </span>
                </Label>
                <Input
                  id={companyId}
                  name="company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Company name"
                  disabled={locked}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={noteId}>
                  What do you want to use it for?{" "}
                  <span className="normal-case tracking-normal opacity-70">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id={noteId}
                  name="note"
                  rows={3}
                  placeholder="A sentence on what you're building helps me send the right version."
                  disabled={locked}
                />
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  disabled={pending}
                  aria-describedby={state && !state.ok ? errorId : undefined}
                >
                  {pending ? "Sending request…" : "Request access"}
                </Button>
              </div>
            </div>
          )}

          {sent ? (
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" size="md" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          ) : null}
        </form>
      </Dialog>
    </>
  );
}
