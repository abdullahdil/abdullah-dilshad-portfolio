import { describe, expect, it } from "vitest";
import { getSiteUrl, siteConfig } from "@/lib/site";

describe("site config", () => {
  it("exposes brand SEO defaults", () => {
    expect(siteConfig.name).toBe("Abdullah Dilshad");
    expect(siteConfig.title).toContain("AI Automation Engineer");
    expect(siteConfig.description.length).toBeGreaterThan(20);
  });

  it("normalizes site URL without trailing slash", () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/";
    expect(getSiteUrl()).toBe("https://example.com");
    process.env.NEXT_PUBLIC_SITE_URL = previous;
  });
});
