import { test, expect } from "@playwright/test";

/**
 * Shortlist tests.
 *
 * After clicking a heart the aria-label changes from "Add X to shortlist"
 * to "Remove X from shortlist". We confirm the save by looking for the
 * Remove-labelled button rather than checking aria-pressed on a locator
 * that no longer matches after the label changes.
 */
test.describe("Shortlist", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.locator("text=Meadowside Nursery")).toBeVisible({ timeout: 10000 });
  });

  test("save and unsave a nursery from a card", async ({ page }) => {
    // Save the first nursery
    await page.getByRole("button", { name: /Add .* to shortlist/ }).first().click();

    // The label changes to Remove after saving — confirm that
    const removeButton = page.getByRole("button", { name: /Remove .* from shortlist/ }).first();
    await expect(removeButton).toBeVisible({ timeout: 5000 });
    await expect(removeButton).toHaveAttribute("aria-pressed", "true");

    // Nav counter should appear
    await expect(page.getByRole("link", { name: /View shortlist/ })).toBeVisible({ timeout: 5000 });

    // Unsave it
    await removeButton.click();
    await expect(page.getByRole("button", { name: /Add .* to shortlist/ }).first()).toBeVisible({ timeout: 5000 });
  });

  test("shortlist page shows saved nurseries and compare view", async ({ page }) => {
    // Save two nurseries
    const allAddButtons = page.getByRole("button", { name: /Add .* to shortlist/ });

    await allAddButtons.first().click();
    await expect(page.getByRole("button", { name: /Remove .* from shortlist/ })).toHaveCount(1, { timeout: 5000 });

    await allAddButtons.first().click();
    await expect(page.getByRole("button", { name: /Remove .* from shortlist/ })).toHaveCount(2, { timeout: 5000 });

    // Navigate to shortlist
    await page.goto("http://localhost:3000/shortlist");
    await expect(page.getByRole("heading", { name: "Your shortlist" })).toBeVisible({ timeout: 10000 });

    // Compare tab only shows when 2+ nurseries are saved
    const compareTab = page.getByRole("tab", { name: "Compare" });
    await expect(compareTab).toBeVisible({ timeout: 5000 });
    await compareTab.click();

    await expect(page.getByRole("rowheader", { name: "Daily fee" })).toBeVisible();
    await expect(page.getByRole("rowheader", { name: "Ofsted" })).toBeVisible();
  });

  test("shortlist persists across page reloads", async ({ page }) => {
    await page.getByRole("button", { name: /Add .* to shortlist/ }).first().click();
    await expect(page.getByRole("button", { name: /Remove .* from shortlist/ }).first()).toBeVisible({ timeout: 5000 });

    await page.reload();
    await expect(page.locator("text=Meadowside Nursery")).toBeVisible({ timeout: 10000 });

    // Should still show as saved after reload
    await expect(page.getByRole("button", { name: /Remove .* from shortlist/ }).first()).toBeVisible({ timeout: 5000 });
  });

  test("empty shortlist shows guidance", async ({ page }) => {
    await page.goto("http://localhost:3000/shortlist");
    await expect(page.getByText("Nothing saved yet")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("link", { name: "Browse nurseries" })).toBeVisible();
  });
});