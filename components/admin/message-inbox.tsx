import {
  deleteMessageAction,
  updateMessageStatusAction,
} from "@/lib/admin/actions/messages";
import type { ContactSubmissionRow } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MessageInbox({ messages }: { messages: ContactSubmissionRow[] }) {
  if (messages.length === 0) {
    return (
      <p className="rounded-lg border border-outline-variant/15 bg-surface-low px-4 py-8 text-center text-body-md text-on-surface-variant">
        No contact submissions yet.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {messages.map((message) => (
        <li
          key={message.id}
          className="space-y-4 border-b border-outline-variant/15 pb-6 last:border-b-0"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-heading text-lg text-on-surface">{message.name}</p>
              <p className="text-sm text-on-surface-variant">
                <a
                  href={`mailto:${message.email}`}
                  className="text-primary hover:underline"
                >
                  {message.email}
                </a>
                {message.company ? ` · ${message.company}` : null}
              </p>
              <p className="mt-1 font-label text-[11px] uppercase tracking-widest text-on-surface-variant">
                {message.opportunity_type} · {formatDate(message.created_at)} ·{" "}
                {message.status}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.status !== "read" ? (
                <form action={updateMessageStatusAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="status" value="read" />
                  <Button type="submit" size="sm" variant="outline">
                    Mark read
                  </Button>
                </form>
              ) : null}
              {message.status !== "unread" ? (
                <form action={updateMessageStatusAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="status" value="unread" />
                  <Button type="submit" size="sm" variant="outline">
                    Mark unread
                  </Button>
                </form>
              ) : null}
              {message.status !== "archived" ? (
                <form action={updateMessageStatusAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="status" value="archived" />
                  <Button type="submit" size="sm" variant="outline">
                    Archive
                  </Button>
                </form>
              ) : null}
              <form action={deleteMessageAction}>
                <input type="hidden" name="id" value={message.id} />
                <Button type="submit" size="sm" variant="ghost">
                  Delete
                </Button>
              </form>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-body-md text-on-surface">
            {message.message}
          </p>
        </li>
      ))}
    </ul>
  );
}
