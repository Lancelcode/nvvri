import { test, expect } from "@playwright/test";

test.describe("SEO", () => {
  test("sitemap.xml is served and lists nursery URLs", async ({ request }) => {
    const res = await request.get("http://localhost:3000/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/nursery/meadowside-nursery");
    expect(body).toContain("/nursery/little-scholars");
  });

  test("robots.txt is served and references sitemap", async ({ request }) => {
    const res = await request.get("http://localhost:3000/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("User-Agent: *");
    expect(body).toContain("Sitemap:");
    expect(body).toContain("/sitemap.xml");
    // Admin and api should be disallowed
    expect(body).toContain("/admin");
    expect(body).toContain("/api");
  });

  test("home page has canonical link, OG tags, and JSON-LD", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /\/$/);

    // OG
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /nvvri/);

    // JSON-LD WebSite schema
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd!);
    expect(parsed["@type"]).toBe("WebSite");
    expect(parsed.potentialAction["@type"]).toBe("SearchAction");
  });

  test("nursery detail page has Preschool JSON-LD", async ({ page }) => {
    await page.goto("http://localhost:3000/nursery/meadowside-nursery");

    // Check it rendered
    await expect(
      page.getByRole("heading", { name: "Meadowside Nursery" })
    ).toBeVisible();

    // Check JSON-LD
    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd!);
    expect(parsed["@type"]).toBe("Preschool");
    expect(parsed.name).toBe("Meadowside Nursery");
    expect(parsed.aggregateRating).toBeTruthy();
    expect(parsed.aggregateRating.ratingValue).toBeGreaterThan(0);
    expect(parsed.address.addressLocality).toBe("Morningside");
  });

  test("unknown nursery slug returns 404", async ({ page }) => {
    const res = await page.goto("http://localhost:3000/nursery/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("Nursery not found")).toBeVisible();
  });

  test("admin route is hidden from unauthenticated visitors", async ({ request }) => {
    const res = await request.get("http://localhost:3000/admin/searches");
    // Middleware should return 404, not 401, to hide existence
    expect(res.status()).toBe(404);
  });
});
