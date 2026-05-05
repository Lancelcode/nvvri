import { test, expect } from "@playwright/test";

test.describe("Shortlist", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.locator("text=Meadowside Nursery")).toBeVisible({
      timeout: 10000,
    });
  });

  test("save and unsave a nursery from a card", async ({ page }) => {
    // First nursery's heart should not be pressed initially
    const firstHeart = page
      .getByRole("button", { name: /Add .* to shortlist/ })
      .first();
    await expect(firstHeart).toBeVisible();
    await expect(firstHeart).toHaveAttribute("aria-pressed", "false");

    // Save it
    await firstHeart.click();
    await expect(firstHeart).toHaveAttribute("aria-pressed", "true");

    // Nav counter should appear with "1"
    const navLink = page.getByRole("link", {
      name: /View shortlist \(1 nursery\)/,
    });
    await expect(navLink).toBeVisible();

    // Unsave it
    await firstHeart.click();
    await expect(firstHeart).toHaveAttribute("aria-pressed", "false");
  });

  test("shortlist page shows saved nurseries and compare view", async ({ page }) => {
    // Save first two nurseries
    const hearts = page.getByRole("button", { name: /Add .* to shortlist/ });
    await hearts.nth(0).click();
    await hearts.nth(1).click();

    // Navigate to shortlist
    await page.getByRole("link", { name: /View shortlist/ }).click();
    await expect(page).toHaveURL(/\/shortlist/);

    // Should see two cards on the shortlist page
    await expect(page.getByRole("heading", { name: "Your shortlist" })).toBeVisible();

    // Switch to compare view
    await page.getByRole("tab", { name: "Compare" }).click();

    // Compare table should show row labels
    await expect(page.getByRole("rowheader", { name: "Daily fee" })).toBeVisible();
    await expect(page.getByRole("rowheader", { name: "Ofsted" })).toBeVisible();
    await expect(page.getByRole("rowheader", { name: "Tags" })).toBeVisible();
  });

  test("shortlist persists across page reloads", async ({ page }) => {
    const firstHeart = page
      .getByRole("button", { name: /Add .* to shortlist/ })
      .first();
    await firstHeart.click();
    await expect(firstHeart).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await expect(page.locator("text=Meadowside Nursery")).toBeVisible({
      timeout: 10000,
    });

    // Heart should still be pressed
    const heartAfterReload = page
      .getByRole("button", { name: /Remove .* from shortlist/ })
      .first();
    await expect(heartAfterReload).toBeVisible();
    await expect(heartAfterReload).toHaveAttribute("aria-pressed", "true");
  });

  test("empty shortlist shows guidance", async ({ page }) => {
    await page.goto("http://localhost:3000/shortlist");
    await expect(page.getByText("Nothing saved yet")).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse nurseries" })).toBeVisible();
  });
});
