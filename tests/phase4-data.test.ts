import { describe, expect, it } from "vitest";
import {
  canMutateContent,
  canReadContactSubmissions,
  isAuthorizedAdminUser,
} from "@/lib/auth/authorized-admin";
import { filterPublished, isPubliclyVisible } from "@/lib/content/filters";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { caseStudySchema } from "@/lib/validations/case-study";
import { toSlug } from "@/lib/validations/common";
import { contactSubmissionSchema } from "@/lib/validations/contact";
import { caseStudies } from "@/lib/content/case-studies";

describe("publish filtering", () => {
  it("allows only published status rows", () => {
    const rows = [
      { status: "published" as const, slug: "a" },
      { status: "draft" as const, slug: "b" },
      { status: "archived" as const, slug: "c" },
    ];
    expect(filterPublished(rows).map((row) => row.slug)).toEqual(["a"]);
    expect(isPubliclyVisible({ status: "draft" })).toBe(false);
  });

  it("allows only is_published true rows", () => {
    const rows = [
      { is_published: true, id: "1" },
      { is_published: false, id: "2" },
    ];
    expect(filterPublished(rows)).toHaveLength(1);
  });
});

describe("authorization helpers", () => {
  const admins = ["admin-1", "admin-2"] as const;

  it("rejects unauthenticated and unauthorized users", () => {
    expect(
      isAuthorizedAdminUser({ userId: null, isAuthenticated: false }, admins),
    ).toBe(false);
    expect(
      isAuthorizedAdminUser({ userId: "user-9", isAuthenticated: true }, admins),
    ).toBe(false);
  });

  it("allows authorized admins to mutate and read contacts", () => {
    const identity = { userId: "admin-1", isAuthenticated: true };
    expect(canMutateContent(identity, admins)).toBe(true);
    expect(canReadContactSubmissions(identity, admins)).toBe(true);
    expect(
      canReadContactSubmissions(
        { userId: "user-9", isAuthenticated: true },
        admins,
      ),
    ).toBe(false);
  });
});

describe("zod validation", () => {
  it("accepts a verified case study shape", () => {
    const study = caseStudies[0];
    const parsed = caseStudySchema.safeParse({
      ...study,
      status: "published",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid slugs and honeypot-filled contact forms", () => {
    expect(toSlug("AI Lead Generation!")).toBe("ai-lead-generation");
    expect(
      contactSubmissionSchema.safeParse({
        name: "Ada",
        email: "ada@example.com",
        opportunityType: "Automation project",
        message: "Hello",
        companyWebsite: "https://spam.example",
      }).success,
    ).toBe(false);
  });

  it("accepts a valid contact payload with empty honeypot", () => {
    const parsed = contactSubmissionSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      company: "Example",
      opportunityType: "Full-time remote role",
      message: "Interested in automation systems.",
      companyWebsite: "",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("supabase env detection", () => {
  it("reports unconfigured when env placeholders are used", () => {
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const previousAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://your-project-ref.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-anon-key";
    expect(isSupabaseConfigured()).toBe(false);

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(isSupabaseConfigured()).toBe(false);

    process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousAnon;
  });
});
