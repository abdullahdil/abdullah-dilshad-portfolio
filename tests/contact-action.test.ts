import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// submitContactAction — either channel succeeding is a successful submission.
// ---------------------------------------------------------------------------

const mocks = vi.hoisted(() => ({
  clientKey: { value: "test" },
  supabaseConfigured: { value: true },
  emailConfigured: { value: true },
  insertResult: {
    value: { data: { id: "row-1" }, error: null } as {
      data: { id: string } | null;
      error: { code: string } | null;
    },
  },
  sendResult: { value: { ok: true } as { ok: boolean; error?: string } },
  send: vi.fn(),
  insert: vi.fn(),
}));

vi.mock("@/lib/contact/client-meta", () => ({
  getRequestClientKey: async () => mocks.clientKey.value,
}));

vi.mock("@/lib/supabase/env", async (orig) => ({
  ...(await orig<typeof import("@/lib/supabase/env")>()),
  isSupabaseConfigured: () => mocks.supabaseConfigured.value,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createServiceRoleSupabaseClient: () => ({
    from: () => ({
      insert: (row: unknown) => {
        mocks.insert(row);
        return {
          select: () => ({ single: async () => mocks.insertResult.value }),
        };
      },
    }),
  }),
}));

vi.mock("@/lib/contact/notify-email", async (orig) => ({
  ...(await orig<typeof import("@/lib/contact/notify-email")>()),
  isContactEmailConfigured: () => mocks.emailConfigured.value,
  sendContactNotification: async (s: unknown) => {
    mocks.send(s);
    return mocks.sendResult.value;
  },
}));

let keyCounter = 0;

function form() {
  const fd = new FormData();
  fd.set("name", "Jane");
  fd.set("email", "jane@example.com");
  fd.set("company", "");
  fd.set("opportunity_type", "Collaboration");
  fd.set("message", "Hello there");
  fd.set("company_website", "");
  return fd;
}

describe("submitContactAction delivery channels", () => {
  beforeEach(() => {
    mocks.clientKey.value = `client-${++keyCounter}`;
    mocks.supabaseConfigured.value = true;
    mocks.emailConfigured.value = true;
    mocks.insertResult.value = { data: { id: "row-1" }, error: null };
    mocks.sendResult.value = { ok: true };
    mocks.send.mockReset();
    mocks.insert.mockReset();
  });

  const cases: Array<[string, boolean, boolean, boolean]> = [
    ["db ok + email ok", true, true, true],
    ["db ok + email fails", true, false, true],
    ["db fails + email ok", false, true, true],
    ["db fails + email fails", false, false, false],
  ];

  it.each(cases)("%s", async (_label, dbOk, emailOk, expected) => {
    mocks.insertResult.value = dbOk
      ? { data: { id: "row-1" }, error: null }
      : { data: null, error: { code: "500" } };
    mocks.sendResult.value = emailOk ? { ok: true } : { ok: false, error: "x" };
    const { submitContactAction } = await import("@/lib/contact/actions");
    const result = await submitContactAction(null, form());
    expect(result.ok).toBe(expected);
    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });

  it("works with email only when Supabase is not configured", async () => {
    mocks.supabaseConfigured.value = false;
    const { submitContactAction } = await import("@/lib/contact/actions");
    const result = await submitContactAction(null, form());
    expect(result.ok).toBe(true);
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });

  it("errors clearly when neither channel is configured", async () => {
    mocks.supabaseConfigured.value = false;
    mocks.emailConfigured.value = false;
    const { submitContactAction } = await import("@/lib/contact/actions");
    const result = await submitContactAction(null, form());
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.error).toMatch(/not configured/);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("silently succeeds for the honeypot without sending", async () => {
    const fd = form();
    fd.set("company_website", "spam.example");
    const { submitContactAction } = await import("@/lib/contact/actions");
    const result = await submitContactAction(null, fd);
    expect(result.ok).toBe(true);
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
