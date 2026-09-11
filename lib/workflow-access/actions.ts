"use server";

import { formString } from "@/lib/admin/form-utils";
import type { ActionResult } from "@/lib/admin/types";
import { getRequestClientKey } from "@/lib/contact/client-meta";
import { checkRateLimit } from "@/lib/rate-limit";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { workflowAccessRequestSchema } from "@/lib/validations/workflow-access";

const ACCESS_LIMIT = 3;
const ACCESS_WINDOW_MS = 15 * 60 * 1000;

const SUCCESS_MESSAGE =
  "Request received. I'll email you the workflow export at the address you gave.";

async function notifyWebhook(payload: Record<string, unknown>) {
  // Dedicated variable only. Deliberately does NOT fall back to the contact
  // webhook: that would route requester PII into a workflow built for a
  // different purpose without the operator opting in. Point both variables at
  // the same URL if one hook should handle both.
  const url = process.env.N8N_WORKFLOW_ACCESS_WEBHOOK_URL?.trim();
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

export async function requestWorkflowAccessAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const honeypot = formString(formData, "company_website");
  if (honeypot.trim() !== "") {
    // Silent success for bots
    return { ok: true, message: SUCCESS_MESSAGE };
  }

  const clientKey = await getRequestClientKey();
  const limited = checkRateLimit(
    `workflow-access:${clientKey}`,
    ACCESS_LIMIT,
    ACCESS_WINDOW_MS,
  );
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many requests. Try again in about ${limited.retryAfterSec}s.`,
    };
  }

  const parsed = workflowAccessRequestSchema.safeParse({
    workflowId: formString(formData, "workflow_id"),
    workflowTitle: formString(formData, "workflow_title"),
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    company: formString(formData, "company"),
    note: formString(formData, "note"),
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
        "Access requests are not configured yet. Please email me directly using the address on this page.",
    };
  }

  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Access requests are unavailable. Please email me directly.",
    };
  }

  const row = {
    workflow_id: parsed.data.workflowId,
    workflow_title: parsed.data.workflowTitle,
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company?.trim() ? parsed.data.company.trim() : null,
    note: parsed.data.note?.trim() ? parsed.data.note.trim() : null,
    status: "pending" as const,
  };

  const { data, error } = await supabase
    .from("workflow_access_requests")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      error:
        "Could not record your request. Please try again or email me directly.",
    };
  }

  await notifyWebhook({
    id: data.id,
    ...row,
    source: "portfolio-workflow-access",
  });

  return { ok: true, message: SUCCESS_MESSAGE };
}
