import { expect, test } from "@playwright/test";

test.describe("public critical flows", () => {
  test("homepage renders brand and primary sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
    await expect(page.getByRole("button", { name: /deploy automation request/i })).toBeVisible();
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
