import { test, expect } from "@playwright/test";

const TEST_EMAIL = "djibysowrebollo@gmail.com";
const TEST_PHONE = "1234567890";
const TEST_MESSAGE = "test message";
const CHILD_DOB = "2024-01-10"; // 10th Jan
const START_DATE = "2025-01-20"; // 20th Jan

async function fillEnquiryForm(page: import("@playwright/test").Page) {
  // Step 1 — personal details
  await page.getByPlaceholder("Your name").fill("Djiby Test");
  await page.getByPlaceholder("07700 900000").fill(TEST_PHONE);
  await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 2 — child details
  await page.locator('input[type="date"]').first().fill(CHILD_DOB);
  await page.locator('input[type="date"]').last().fill(START_DATE);
  await page.getByPlaceholder("Any questions or specific requirements...").fill(TEST_MESSAGE);
  await page.getByRole("button", { name: "Send enquiry" }).click();

  // Confirm success screen
  await expect(page.getByText("Enquiry sent")).toBeVisible({ timeout: 10000 });
}

test.describe("Enquiry flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    // Wait for nurseries to load
    await expect(page.locator("text=Meadowside Nursery")).toBeVisible({ timeout: 10000 });
  });

  test("enquiry from list view", async ({ page }) => {
    // Click Enquire on the first nursery card
    await page.getByRole("button", { name: "Enquire" }).first().click();

    // Modal should open
    await expect(page.getByText("Enquire at")).toBeVisible();

    await fillEnquiryForm(page);

    // Close modal
    await page.getByRole("button", { name: "Done" }).click();

    // Should be back on main page showing nurseries
    await expect(page.locator("text=Meadowside Nursery")).toBeVisible();
  });

  test("enquiry from map view", async ({ page }) => {
    // Switch to map view
    await page.getByRole("button", { name: "Map" }).click();

    // Wait for map to load
    await page.waitForTimeout(2000);

    // Click a marker — Leaflet markers are divs inside the map
    const marker = page.locator(".leaflet-marker-icon").first();
    await marker.click();

    // Wait for popup
    await page.waitForTimeout(500);

    // Click Enquire in the popup
    await page.locator(".leaflet-popup button", { hasText: "Enquire" }).click();

    // Modal should open
    await expect(page.getByText("Enquire at")).toBeVisible();

    await fillEnquiryForm(page);

    // Close modal
    await page.getByRole("button", { name: "Done" }).click();
  });
});