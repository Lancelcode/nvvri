import { test, expect } from "@playwright/test";

/**
 * Shortlist tests.
 *
 * After clicking a heart button the aria-label changes from
 * "Add X to shortlist" to "Remove X from shortlist".
 * We look for the Remove label to confirm the save worked rather than
 * checking aria-pressed on the original locator (which no longer matches
 * after the label changes).
 */
test.describe("Shortlist", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.locator("text=Meadowside Nursery")).toBeVisible({
      timeout: 10000,
    });
  });

  test("save and unsave a nursery from a card", async ({ page }) => {
    // Click the first heart
    const addButton = page
      .getByRole("button", { name: /Add .* to shortlist/ })
      .first();
    await addButton.click();

    // After saving the label changes to "Remove" — look for that
    const removeButton = page
      .getByRole("button", { name: /Remove .* from shortlist/ })
      .first();
    await expect(removeButton).toBeVisible({ timeout: 5000 });
    await expect(removeButton).toHaveAttribute("aria-pressed", "true");

    // Nav counter should appear
    await expect(
      page.getByRole("link", { name: /View shortlist/ })
    ).toBeVisible({ timeout: 5000 });

    // Unsave it
    await removeButton.click();
    // Button should flip back to "Add"
    await expect(
      page.getByRole("button", { name: /Add .* to shortlist/ }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("shortlist page shows saved nurseries and compare view", async ({ page }) => {
    // Save first two nurseries
    const hearts = page.getByRole("button", { name: /Add .* to shortlist/ });
    await hearts.nth(0).click();
    // Wait for first to be saved before clicking second
    await expect(
      page.getByRole("button", { name: /Remove .* from shortlist/ }).first()
    ).toBeVisible({ timeout: 5000 });

    await hearts.first().click(); // re-click Add on the next un-saved card
    // Actually nth(0) is now Remove, so click the new first Add
    const secondAdd = page
      .getByRole("button", { name: /Add .* to shortlist/ })
      .first();
    await secondAdd.click();
    await expect(
      page.getByRole("button", { name: /Remove .* from shortlist/ })
    ).toHaveCount(2, { timeout: 5000 });

    // Navigate to shortlist
    await page.goto("http://localhost:3000/shortlist");
    await expect(
      page.getByRole("heading", { name: "Your shortlist" })
    ).toBeVisible({ timeout: 10000 });

    // Should see the compare tab (only shown when 2+ nurseries saved)
    const compareTab = page.getByRole("tab", { name: "Compare" });
    await expect(compareTab).toBeVisible({ timeout: 5000 });
    await compareTab.click();

    // Compare table row labels
    await expect(
      page.getByRole("rowheader", { name: "Daily fee" })
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "Ofsted" })
    ).toBeVisible();
  });

  test("shortlist persists across page reloads", async ({ page }) => {
    const addButton = page
      .getByRole("button", { name: /Add .* to shortlist/ })
      .first();
    await addButton.click();

    // Confirm saved
    await expect(
      page.getByRole("button", { name: /Remove .* from shortlist/ }).first()
    ).toBeVisible({ timeout: 5000 });

    await page.reload();
    await expect(page.locator("text=Meadowside Nursery")).toBeVisible({
      timeout: 10000,
    });

    // After reload the saved nursery should still show Remove
    await expect(
      page.getByRole("button", { name: /Remove .* from shortlist/ }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("empty shortlist shows guidance", async ({ page }) => {
    await page.goto("http://localhost:3000/shortlist");
    await expect(page.getByText("Nothing saved yet")).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("link", { name: "Browse nurseries" })
    ).toBeVisible();
  });
});