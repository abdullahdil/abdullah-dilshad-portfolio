import { Building2, Inbox, KeyRound, Mail, Send } from "lucide-react";
import {
  deleteWorkflowAccessRequestAction,
  updateWorkflowAccessStatusAction,
} from "@/lib/admin/actions/workflow-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { WorkflowAccessRequestRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function mailtoHref(request: WorkflowAccessRequestRow) {
  const subject = `Your requested workflow: ${request.workflow_title}`;
  const body = [
    `Hi ${request.name.split(" ")[0] || "there"},`,
    "",
    `Thanks for requesting "${request.workflow_title}" — the export is attached.`,
    "",
  ].join("\n");
  return `mailto:${request.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const statusTone: Record<string, string> = {
  pending: "border-transparent bg-accent-soft text-accent",
  sent: "border-outline-variant bg-surface-high text-success",
  declined: "border-outline-variant bg-surface-high text-warning",
  archived: "border-outline-variant bg-surface-high text-on-surface-faint",
};

function StatusAction({
  id,
  status,
  label,
  variant = "outline",
}: {
  id: string;
  status: string;
  label: string;
  variant?: "outline" | "ghost" | "accent";
}) {
  return (
    <form action={updateWorkflowAccessStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={variant}>
        {label}
      </Button>
    </form>
  );
}

function RequestRow({
  request,
  highlight,
}: {
  request: WorkflowAccessRequestRow;
  highlight: boolean;
}) {
  return (
    <li
      className={cn(
        "space-y-3 rounded-lg border px-4 py-4",
        highlight
          ? "border-accent/40 bg-accent-soft"
          : "border-outline-variant/15 bg-surface-low",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-2 font-heading text-lg text-on-surface">
            <KeyRound
              className="size-4 shrink-0 text-on-surface-variant"
              strokeWidth={2}
              aria-hidden
            />
            <span className="truncate">{request.workflow_title}</span>
          </p>
          <p className="text-body-md text-on-surface">{request.name}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant">
            <a
              href={mailtoHref(request)}
              className="inline-flex items-center gap-1.5 text-accent hover:underline"
            >
              <Mail className="size-3.5" strokeWidth={2} aria-hidden />
              {request.email}
            </a>
            {request.company ? (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-3.5" strokeWidth={2} aria-hidden />
                {request.company}
              </span>
            ) : null}
          </p>
          <p className="font-label text-[11px] uppercase tracking-widest text-on-surface-faint">
            {formatDate(request.created_at)} · {request.workflow_id}
          </p>
        </div>
        <Badge className={statusTone[request.status] ?? statusTone.archived}>
          {request.status}
        </Badge>
      </div>

      {request.note ? (
        <p className="whitespace-pre-wrap text-body-md text-on-surface">
          {request.note}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {request.status !== "sent" ? (
          <StatusAction
            id={request.id}
            status="sent"
            label="Mark sent"
            variant={highlight ? "accent" : "outline"}
          />
        ) : null}
        {request.status !== "pending" ? (
          <StatusAction id={request.id} status="pending" label="Reopen" />
        ) : null}
        {request.status !== "declined" ? (
          <StatusAction id={request.id} status="declined" label="Decline" />
        ) : null}
        {request.status !== "archived" ? (
          <StatusAction id={request.id} status="archived" label="Archive" />
        ) : null}
        <form action={deleteWorkflowAccessRequestAction}>
          <input type="hidden" name="id" value={request.id} />
          <Button type="submit" size="sm" variant="ghost">
            Delete
          </Button>
        </form>
      </div>
    </li>
  );
}

export function AccessRequestInbox({
  requests,
}: {
  requests: WorkflowAccessRequestRow[];
}) {
  if (requests.length === 0) {
    return (
      <p className="rounded-lg border border-outline-variant/15 bg-surface-low px-4 py-8 text-center text-body-md text-on-surface-variant">
        No workflow access requests yet.
      </p>
    );
  }

  const pending = requests.filter((request) => request.status === "pending");
  const handled = requests.filter((request) => request.status !== "pending");

  return (
    <div className="space-y-6">
      <Card className={pending.length > 0 ? "border-accent/40" : undefined}>
        <CardHeader>
          <p className="flex items-center gap-2 font-heading text-lg text-on-surface">
            <Send className="size-4 text-accent" strokeWidth={2} aria-hidden />
            Needs a reply
          </p>
          <Badge
            className={
              pending.length > 0
                ? "border-transparent bg-accent text-on-accent"
                : undefined
            }
          >
            {pending.length} pending
          </Badge>
        </CardHeader>
        <CardBody>
          {pending.length === 0 ? (
            <p className="flex items-center gap-2 text-body-md text-on-surface-variant">
              <Inbox className="size-4" strokeWidth={2} aria-hidden />
              All caught up — nothing waiting on an email.
            </p>
          ) : (
            <>
              <p className="mb-4 text-body-sm text-on-surface-variant">
                Email is not automated. Use the address link to send the workflow
                by hand, then mark the request sent.
              </p>
              <ul className="space-y-4">
                {pending.map((request) => (
                  <RequestRow key={request.id} request={request} highlight />
                ))}
              </ul>
            </>
          )}
        </CardBody>
      </Card>

      {handled.length > 0 ? (
        <section className="space-y-4">
          <h3 className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
            Handled · {handled.length}
          </h3>
          <ul className="space-y-4">
            {handled.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                highlight={false}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
