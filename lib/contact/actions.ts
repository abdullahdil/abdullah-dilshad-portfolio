"use server";

import { formString } from "@/lib/admin/form-utils";
import type { ActionResult } from "@/lib/admin/types";
import { getRequestClientKey } from "@/lib/contact/client-meta";
import {
  isContactEmailConfigured,
  sendContactNotification,
} from "@/lib/contact/notify-email";
import { checkRateLimit } from "@/lib/rate-limit";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { contactSubmissionSchema } from "@/lib/validations/contact";

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 15 * 60 * 1000;

async function notifyWebhook(payload: Record<string, unknown>) {
  const url = process.env.N8N_CONTACT_WEBHOOK_URL?.trim();
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Webhook failures must not break form submission.
  }
}

export async function submitContactAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const honeypot = formString(formData, "company_website");
  if (honeypot.trim() !== "") {
    // Silent success for bots
    return { ok: true, message: "Thanks — I will follow up shortly." };
  }

  const clientKey = await getRequestClientKey();
  const limited = checkRateLimit(
    `contact:${clientKey}`,
    CONTACT_LIMIT,
    CONTACT_WINDOW_MS,
  );
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many requests. Try again in about ${limited.retryAfterSec}s.`,
    };
  }

  const parsed = contactSubmissionSchema.safeParse({
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    company: formString(formData, "company"),
    opportunityType: formString(formData, "opportunity_type"),
    message: formString(formData, "message"),
    companyWebsite: honeypot,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form fields.",
    };
  }

  const row = {
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company?.trim() ? parsed.data.company.trim() : null,
    opportunity_type: parsed.data.opportunityType,
    message: parsed.data.message,
    status: "unread" as const,
  };

  const storageConfigured = isSupabaseConfigured();
  const emailConfigured = isContactEmailConfigured();
  if (!storageConfigured && !emailConfigured) {
    return {
      ok: false,
      error:
        "Contact storage is not configured yet. Please email me directly using the address on this page.",
    };
  }

  // Two independent delivery channels run concurrently: the admin inbox
  // (Supabase) and an email to the owner (Resend). Either one landing is
  // enough — a Supabase outage still reaches the mailbox, an email outage
  // still lands in /admin/messages.
  const stored = storageConfigured
    ? storeSubmission(row)
    : Promise.resolve<StoreResult>({ ok: false });

  const emailed = emailConfigured
    ? sendContactNotification({
        name: row.name,
        email: row.email,
        company: row.company,
        opportunityType: row.opportunity_type,
        message: row.message,
        submittedAt: new Date(),
      })
    : Promise.resolve({ ok: false, error: "not configured" });

  // The webhook carries the stored id, so it follows the insert (as before),
  // while the email is already in flight.
  const webhooked = stored.then((result) =>
    result.ok
      ? notifyWebhook({ id: result.id, ...row, source: "portfolio-contact" })
      : undefined,
  );

  const [storeResult, emailResult] = await Promise.all([
    stored,
    emailed,
    webhooked,
  ]);

  if (!storeResult.ok && !emailResult.ok) {
    return {
      ok: false,
      error: "Could not send your message. Please try again or email me directly.",
    };
  }

  return { ok: true, message: "Thanks — I will follow up shortly." };
}

type ContactRow = {
  name: string;
  email: string;
  company: string | null;
  opportunity_type: string;
  message: string;
  status: "unread";
};

type StoreResult = { ok: true; id: string } | { ok: false };

async function storeSubmission(row: ContactRow): Promise<StoreResult> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    if (!supabase) return { ok: false };

    const { data, error } = await supabase
      .from("contact_submissions")
      .insert(row)
      .select("id")
      .single();

    if (error || !data) {
      console.warn(
        `[contact] insert failed: ${error?.code ?? "no data"}`,
      );
      return { ok: false };
    }
    return { ok: true, id: data.id };
  } catch {
    // e.g. service-role key missing — let the email channel carry it.
    console.warn("[contact] insert failed: storage client unavailable");
    return { ok: false };
  }
}
