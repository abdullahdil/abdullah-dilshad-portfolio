import { describe, expect, it, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/rate-limit";
import { contactSubmissionSchema } from "@/lib/validations/contact";
import {
  sanitizeStorageFileName,
  validateUploadFile,
} from "@/lib/validations/media";

describe("contact submission schema", () => {
  it("accepts a valid submission", () => {
    const parsed = contactSubmissionSchema.safeParse({
      name: "Alex Recruiter",
      email: "alex@company.com",
      company: "Acme",
      opportunityType: "Full-time remote role",
      message: "Need automation help on lead routing.",
      companyWebsite: "",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects filled honeypot", () => {
    const parsed = contactSubmissionSchema.safeParse({
      name: "Bot",
      email: "bot@example.com",
      opportunityType: "Other",
      message: "spam",
      companyWebsite: "https://spam.example",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("rate limit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows up to the limit then blocks", () => {
    expect(checkRateLimit("t", 2, 60_000).ok).toBe(true);
    expect(checkRateLimit("t", 2, 60_000).ok).toBe(true);
    const blocked = checkRateLimit("t", 2, 60_000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });
});

describe("media validation", () => {
  it("sanitizes file names", () => {
    expect(sanitizeStorageFileName("../../Weird Name!!!.PNG")).toBe(
      "weird-name-.png",
    );
  });

  it("validates image and pdf constraints", () => {
    const image = new File([new Uint8Array(10)], "shot.png", {
      type: "image/png",
    });
    expect(validateUploadFile(image, "media").ok).toBe(true);

    const badImage = new File([new Uint8Array(10)], "doc.pdf", {
      type: "application/pdf",
    });
    expect(validateUploadFile(badImage, "media").ok).toBe(false);

    const pdf = new File([new Uint8Array(10)], "cv.pdf", {
      type: "application/pdf",
    });
    expect(validateUploadFile(pdf, "cv").ok).toBe(true);
  });
});
