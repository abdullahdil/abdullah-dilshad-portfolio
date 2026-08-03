"use server";

import { formString } from "@/lib/admin/form-utils";
import type { ActionResult } from "@/lib/admin/types";
import { getRequestClientKey } from "@/lib/contact/client-meta";
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

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error:
        "Contact storage is not configured yet. Please email me directly using the address on this page.",
    };
  }

  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Contact storage is unavailable. Please email me directly.",
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

  const { data, error } = await supabase
    .from("contact_submissions")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      error: "Could not send your message. Please try again or email me directly.",
    };
  }

  await notifyWebhook({
    id: data.id,
    ...row,
    source: "portfolio-contact",
  });

  return { ok: true, message: "Thanks — I will follow up shortly." };
}
