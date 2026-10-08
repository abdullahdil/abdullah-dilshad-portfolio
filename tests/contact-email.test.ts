import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ENV_KEYS = [
  "RESEND_API_KEY",
  "CONTACT_NOTIFY_EMAIL",
  "CONTACT_FROM_EMAIL",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) saved[key] = process.env[key];
  for (const key of ENV_KEYS) delete process.env[key];
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const submission = {
  name: "Eve <script>alert(1)</script>\r\nBcc: victim@example.com",
  email: "eve@example.com",
  company: "Acme & Sons",
  opportunityType: "Automation project",
  message: "Line one\nLine <b>two</b>",
  submittedAt: new Date("2026-01-02T03:04:00Z"),
};

describe("sendContactNotification", () => {
  it("skips without calling fetch when RESEND_API_KEY is missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { sendContactNotification } = await import("@/lib/contact/notify-email");
    const result = await sendContactNotification(submission);
    expect(result).toEqual({ ok: false, error: "not configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("builds the Resend request with defaults, reply_to and escaped HTML", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.dev";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_1" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { sendContactNotification } = await import("@/lib/contact/notify-email");

    const result = await sendContactNotification(submission);
    expect(result).toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer re_test_key");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(init.signal).toBeInstanceOf(AbortSignal);

    const body = JSON.parse(init.body as string);
    expect(body.to).toEqual(["abdullahdilshad111@gmail.com"]);
    expect(body.from).toBe("Portfolio Contact <onboarding@resend.dev>");
    expect(body.reply_to).toBe("eve@example.com");
    expect(body.subject).not.toMatch(/[\r\n]/);
    expect(body.subject).toContain("New portfolio message");
    expect(body.subject).toContain("(Automation project)");
    expect(body.html).not.toContain("<script>");
    expect(body.html).toContain("&lt;script&gt;");
    expect(body.html).toContain("Acme &amp; Sons");
    expect(body.html).toContain("Line one<br>Line &lt;b&gt;two&lt;/b&gt;");
    expect(body.html).toContain("https://example.dev/admin/messages");
    expect(body.text).toContain("Line one\nLine <b>two</b>");
    expect(body.text).toContain("UTC");
    expect(body.text).toContain("PKT");
  });

  it("honours CONTACT_NOTIFY_EMAIL / CONTACT_FROM_EMAIL overrides", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_NOTIFY_EMAIL = "owner@example.com";
    process.env.CONTACT_FROM_EMAIL = "Site <hello@example.com>\r\nX: y";
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { sendContactNotification } = await import("@/lib/contact/notify-email");
    await sendContactNotification(submission);
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.to).toEqual(["owner@example.com"]);
    expect(body.from).toBe("Site <hello@example.com> X: y");
  });

  it("returns ok:false on a non-2xx response without leaking the key", async () => {
    process.env.RESEND_API_KEY = "re_secret_value";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ statusCode: 403, name: "validation_error", message: "x" }),
          { status: 403 },
        ),
      ),
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { sendContactNotification } = await import("@/lib/contact/notify-email");
    const result = await sendContactNotification(submission);
    expect(result).toEqual({ ok: false, error: "Resend 403 validation_error" });
    const logged = warn.mock.calls.flat().join(" ");
    expect(logged).toContain("403");
    expect(logged).not.toContain("re_secret_value");
    expect(logged).not.toContain("Line one");
  });

  it("times out after 8s without throwing", async () => {
    vi.useFakeTimers();
    process.env.RESEND_API_KEY = "re_test_key";
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => {
              const err = new Error("aborted");
              err.name = "AbortError";
              reject(err);
            });
          }),
      ),
    );
    const { sendContactNotification } = await import("@/lib/contact/notify-email");
    const pending = sendContactNotification(submission);
    await vi.advanceTimersByTimeAsync(8000);
    await expect(pending).resolves.toEqual({ ok: false, error: "timeout" });
  });

  it("handles network errors without throwing", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    const { sendContactNotification } = await import("@/lib/contact/notify-email");
    await expect(sendContactNotification(submission)).resolves.toEqual({
      ok: false,
      error: "network error",
    });
  });
});
