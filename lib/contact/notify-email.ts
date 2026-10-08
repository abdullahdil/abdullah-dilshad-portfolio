/**
 * Server-only: emails the site owner about a new contact-form submission via
 * Resend's HTTPS API (no SDK). Never import this into a Client Component — it
 * reads RESEND_API_KEY. It never throws; callers get `{ ok, error? }`.
 */
import { profileSeed } from "@/lib/content/seed";
import { getSiteUrl } from "@/lib/site";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Portfolio Contact <onboarding@resend.dev>";
const TIMEOUT_MS = 8000;

export type ContactNotification = {
  name: string;
  email: string;
  company?: string | null;
  opportunityType: string;
  message: string;
  submittedAt?: Date;
};

export type ContactNotificationResult = { ok: boolean; error?: string };

function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY?.trim() || undefined;
}

/** True when the email channel can attempt delivery. */
export function isContactEmailConfigured(): boolean {
  return Boolean(getResendApiKey());
}

/** Header-bound values must never carry CR/LF (header injection). */
export function stripHeaderBreaks(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatTimestamp(date: Date): { utc: string; pkt: string } {
  const fmt = (timeZone: string) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  return { utc: `${fmt("UTC")} UTC`, pkt: `${fmt("Asia/Karachi")} PKT` };
}

export function buildContactEmail(submission: ContactNotification) {
  const to = stripHeaderBreaks(
    process.env.CONTACT_NOTIFY_EMAIL?.trim() || profileSeed.email,
  );
  const from = stripHeaderBreaks(
    process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM,
  );
  const name = stripHeaderBreaks(submission.name);
  const replyTo = stripHeaderBreaks(submission.email);
  const opportunity = stripHeaderBreaks(submission.opportunityType);
  const company = submission.company?.trim() ? submission.company.trim() : "";
  const { utc, pkt } = formatTimestamp(submission.submittedAt ?? new Date());
  const inboxUrl = `${getSiteUrl()}/admin/messages`;

  const subject = stripHeaderBreaks(
    `New portfolio message — ${name} (${opportunity})`,
  );

  const rows: Array<[string, string]> = [
    ["Name", submission.name],
    ["Email", submission.email],
    ["Company", company || "—"],
    ["Opportunity", submission.opportunityType],
    ["Submitted", `${utc} · ${pkt}`],
  ];

  const text = [
    "New message from the portfolio contact form.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    submission.message,
    "",
    `Admin inbox: ${inboxUrl}`,
    "Reply to this email to answer the sender directly.",
  ].join("\n");

  const cell = "padding:6px 12px 6px 0;vertical-align:top;";
  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
<h1 style="font-size:18px;margin:0 0 16px;">New portfolio message</h1>
<table style="border-collapse:collapse;font-size:14px;line-height:1.5;">
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="${cell}color:#6b7280;white-space:nowrap;">${escapeHtml(label)}</td><td style="${cell}">${escapeHtml(value)}</td></tr>`,
  )
  .join("\n")}
</table>
<h2 style="font-size:14px;margin:20px 0 8px;color:#6b7280;font-weight:600;">Message</h2>
<div style="font-size:14px;line-height:1.6;white-space:pre-wrap;border-left:3px solid #e5e7eb;padding-left:12px;">${escapeHtml(submission.message).replace(/\r?\n/g, "<br>")}</div>
<p style="margin:24px 0 0;font-size:13px;"><a href="${escapeHtml(inboxUrl)}" style="color:#2563eb;">Open the admin inbox</a> · or just reply to this email.</p>
</div>
</body></html>`;

  return { from, to: [to], subject, html, text, reply_to: replyTo };
}

export async function sendContactNotification(
  submission: ContactNotification,
): Promise<ContactNotificationResult> {
  if (typeof window !== "undefined") {
    return { ok: false, error: "server only" };
  }

  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { ok: false, error: "not configured" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body = buildContactEmail(submission);
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorName = "unknown_error";
      try {
        const payload = (await response.json()) as { name?: unknown };
        if (typeof payload?.name === "string") errorName = payload.name;
      } catch {
        // Non-JSON error body — status alone is enough.
      }
      const error = `Resend ${response.status} ${errorName}`;
      console.warn(`[contact-email] delivery failed: ${error}`);
      return { ok: false, error };
    }

    return { ok: true };
  } catch (err) {
    const error =
      err instanceof Error && err.name === "AbortError"
        ? "timeout"
        : "network error";
    console.warn(`[contact-email] delivery failed: ${error}`);
    return { ok: false, error };
  } finally {
    clearTimeout(timer);
  }
}
