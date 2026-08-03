import { describe, expect, it } from "vitest";
import {
  arrayToLines,
  linesToArray,
  parseJsonField,
} from "@/lib/admin/form-utils";
import { capabilitySchema } from "@/lib/validations/capability";
import { experienceSchema } from "@/lib/validations/experience";
import { siteSettingsSchema } from "@/lib/validations/settings";
import { templateSchema } from "@/lib/validations/template";
import { z } from "zod";

describe("admin form utils", () => {
  it("splits and joins multiline lists", () => {
    expect(linesToArray("a\n\nb\n c ")).toEqual(["a", "b", "c"]);
    expect(arrayToLines(["a", "b"])).toBe("a\nb");
  });

  it("parses JSON fields with zod", () => {
    const ok = parseJsonField(
      '[{"label":"A","detail":"B"}]',
      z.array(z.object({ label: z.string(), detail: z.string() })),
      "Nodes",
    );
    expect(ok.ok).toBe(true);
    const bad = parseJsonField("{", z.object({}), "Nodes");
    expect(bad.ok).toBe(false);
  });
});

describe("cms schemas", () => {
  it("validates experience with current role", () => {
    const parsed = experienceSchema.safeParse({
      organization: "AiMark Labs",
      role: "AI Automation Engineer",
      location: "Islamabad",
      startDate: "2025-08-01",
      endDate: "",
      isCurrent: true,
      description: "Builds production workflows.",
      displayOrder: 0,
      isPublished: true,
    });
    expect(parsed.success).toBe(true);
  });

  it("requires end date when not current", () => {
    const parsed = experienceSchema.safeParse({
      organization: "Client",
      role: "Engineer",
      location: "Remote",
      startDate: "2024-08-01",
      endDate: "",
      isCurrent: false,
      description: "Work",
      displayOrder: 1,
      isPublished: true,
    });
    expect(parsed.success).toBe(false);
  });

  it("validates capability, template, and settings", () => {
    expect(
      capabilitySchema.safeParse({
        category: "Automation Engineering",
        name: "n8n",
        description: "",
        displayOrder: 1,
        isPublished: true,
      }).success,
    ).toBe(true);

    expect(
      templateSchema.safeParse({
        title: "Template",
        description: "A public template",
        externalUrl: "https://n8n.io/creators/abdullahmil/",
        tools: ["n8n"],
        accent: "primary",
        displayOrder: 0,
        isPublished: true,
      }).success,
    ).toBe(true);

    expect(
      siteSettingsSchema.safeParse({
        availabilityStatus: "available",
        availabilityLabel: "Available for Remote Work",
        responseTimeNote: "Usually within 24h",
        footerNote: "",
      }).success,
    ).toBe(true);
  });
});
