import { MessageInbox } from "@/components/admin/message-inbox";
import { listAdminMessages } from "@/lib/repositories/admin/messages";
import type { ContactSubmissionRow } from "@/lib/supabase/database.types";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  let messages: ContactSubmissionRow[] = [];
  let error: string | null = null;

  try {
    messages = await listAdminMessages();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load messages.";
  }

  const unread = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-headline-lg text-on-surface">Messages</h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Contact inbox · {unread} unread · {messages.length} total
        </p>
      </div>
      {error ? (
        <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      ) : (
        <MessageInbox messages={messages} />
      )}
    </div>
  );
}
