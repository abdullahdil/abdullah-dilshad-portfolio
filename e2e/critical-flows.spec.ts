import { expect, test } from "@playwright/test";

test.describe("public critical flows", () => {
  test("homepage renders brand and primary sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
    await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
  });

  test("case study page loads from seed slug", async ({ page }) => {
    await page.goto("/work/ai-lead-generation-outreach-engine");
    await expect(
      page.getByRole("heading", {
        name: /AI Lead Generation\s*(&|and)\s*Outreach Engine/i,
      }),
    ).toBeVisible();
  });

  test("unknown work slug returns 404", async ({ page }) => {
    const response = await page.goto("/work/this-slug-does-not-exist-404");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: /page not found/i }),
    ).toBeVisible();
  });

  test("robots and sitemap are available", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const robotsBody = await robots.text();
    expect(robotsBody).toContain("Disallow: /admin");
    expect(robotsBody).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain("/work/ai-lead-generation-outreach-engine");
  });
});

test.describe("admin auth gate", () => {
  test("unauthenticated admin route redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { name: /Abdullah/i })).toBeVisible();
    await expect(page.getByText(/command center/i)).toBeVisible();
  });
});

test.describe("work hub and workflow pages", () => {
  test("work hub lists case studies and the workflow catalog", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#catalog")).toBeVisible();
    await expect(page.locator('a[href^="/workflows/"]').first()).toBeVisible();
  });

  test("a workflow detail page renders and unknown slugs 404", async ({ page }) => {
    await page.goto("/work");
    const href = await page.locator('a[href^="/workflows/"]').first().getAttribute("href");
    expect(href).toBeTruthy();
    await page.goto(href!);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const missing = await page.goto("/workflows/this-workflow-does-not-exist");
    expect(missing?.status()).toBe(404);
  });

  test("home exposes ProfilePage structured data and admin is noindex", async ({ page, request }) => {
    await page.goto("/");
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.join("")).toContain("ProfilePage");
    const admin = await request.get("/admin/login");
    expect(await admin.text()).toMatch(/<meta name="robots" content="noindex/);
  });
});
