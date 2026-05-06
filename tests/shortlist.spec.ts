import { test, expect } from "@playwright/test";

/**
 * Shortlist tests.
 *
 * After clicking a heart the aria-label changes from "Add X to shortlist"
 * to "Remove X from shortlist". We confirm saves by looking for Remove
 * buttons rather than checking aria-pressed on the original locator.
 */
test.describe("Shortlist", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.locator("text=Meadowside Nursery")).toBeVisible({ timeout: 10000 });
  });

  test("save and unsave a nursery from a card", async ({ page }) => {
    // Save the first nursery
    await page.getByRole("button", { name: /Add .* to shortlist/ }).first().click();

    // Label flips to Remove — confirm save worked
    const removeButton = page.getByRole("button", { name: /Remove .* from shortlist/ }).first();
    await expect(removeButton).toBeVisible({ timeout: 5000 });
    await expect(removeButton).toHaveAttribute("aria-pressed", "true");

    // Nav counter should appear
    await expect(page.getByRole("link", { name: /View shortlist/ })).toBeVisible({ timeout: 5000 });

    // Unsave it
    await removeButton.click();
    await expect(page.getByRole("button", { name: /Add .* to shortlist/ }).first()).toBeVisible({ timeout: 5000 });
  });



  test("shortlist persists across page reloads", async ({ page }) => {
    const firstCard = page.locator("article").first();
    await firstCard.getByRole("button", { name: /Add .* to shortlist/ }).click();
    await expect(firstCard.getByRole("button", { name: /Remove .* from shortlist/ })).toBeVisible({ timeout: 5000 });

    await page.reload();
    await expect(page.locator("text=Meadowside Nursery")).toBeVisible({ timeout: 10000 });

    // First card should still be saved after reload
    await expect(page.locator("article").first().getByRole("button", { name: /Remove .* from shortlist/ })).toBeVisible({ timeout: 5000 });
  });

  test("empty shortlist shows guidance", async ({ page }) => {
    await page.goto("http://localhost:3000/shortlist");
    await expect(page.getByText("Nothing saved yet")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("link", { name: "Browse nurseries" })).toBeVisible();
  });
});