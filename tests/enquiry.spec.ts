import { test, expect } from "@playwright/test";

/**
 * Enquiry flow tests.
 *
 * POST /api/enquiry is intercepted so no Resend emails are sent in CI.
 * The interceptor still validates the request shape, so we test the real form.
 */

const TEST_EMAIL = "djibysowrebollo@gmail.com";
const TEST_PHONE = "1234567890";
const TEST_MESSAGE = "test message";
const CHILD_DOB = "2024-01-10";
const START_DATE = "2025-01-20";

async function mockEnquiryRoute(page: import("@playwright/test").Page) {
  await page.route("**/api/enquiry", async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    const required = ["nurseryName", "nurseryArea", "name", "email", "phone", "childDob", "startDate"];
    const missing = required.filter((k) => !body[k]);
    if (missing.length > 0) {
      await route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: `Missing: ${missing.join(", ")}` }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
}

async function fillEnquiryForm(page: import("@playwright/test").Page) {
  await page.getByPlaceholder("Your name").fill("Djiby Test");
  await page.getByPlaceholder("07700 900000").fill(TEST_PHONE);
  await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator('input[type="date"]').first().fill(CHILD_DOB);
  await page.locator('input[type="date"]').last().fill(START_DATE);
  await page.getByPlaceholder("Any questions or specific requirements...").fill(TEST_MESSAGE);
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByText("Enquiry sent")).toBeVisible({ timeout: 10000 });
}

test.describe("Enquiry flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockEnquiryRoute(page);
    await page.goto("http://localhost:3000");
    await expect(page.locator("text=Meadowside Nursery")).toBeVisible({ timeout: 10000 });
  });

  test("enquiry from list view", async ({ page }) => {
    await page.getByRole("button", { name: "Enquire" }).first().click();
    await expect(page.getByText("Enquire at")).toBeVisible();
    await fillEnquiryForm(page);
    await page.getByRole("button", { name: "Done" }).click();
    await expect(page.locator("text=Meadowside Nursery")).toBeVisible();
  });

  test("enquiry from map view", async ({ page }) => {
    // ViewToggle buttons have role="tab" — must use getByRole("tab")
    await page.getByRole("tab", { name: "Map" }).click();
    await page.waitForTimeout(2000);

    const marker = page.locator(".leaflet-marker-icon").first();
    await marker.click();
    await page.waitForTimeout(500);

    await page.locator(".leaflet-popup button", { hasText: "Enquire" }).click();
    await expect(page.getByText("Enquire at")).toBeVisible();
    await fillEnquiryForm(page);
    await page.getByRole("button", { name: "Done" }).click();
  });

  test("validation rejects an empty name", async ({ page }) => {
    await page.getByRole("button", { name: "Enquire" }).first().click();
    await expect(page.getByText("Enquire at")).toBeVisible();
    await page.getByPlaceholder("07700 900000").fill(TEST_PHONE);
    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Child date of birth")).not.toBeVisible();
  });

  test("validation rejects a malformed email", async ({ page }) => {
    await page.getByRole("button", { name: "Enquire" }).first().click();
    await page.getByPlaceholder("Your name").fill("Test User");
    await page.getByPlaceholder("07700 900000").fill(TEST_PHONE);
    await page.getByPlaceholder("you@example.com").fill("not-an-email");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Enter a valid email")).toBeVisible();
  });

  test("ESC closes the modal", async ({ page }) => {
    await page.getByRole("button", { name: "Enquire" }).first().click();
    await expect(page.getByText("Enquire at")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Enquire at")).not.toBeVisible();
  });
});