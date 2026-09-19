import { test, expect } from "@playwright/test";

test("Customer attempts to book a 30-minute trial flight end-to-end", async ({ page }) => {
  page.on("console", (msg) => console.log(`[BROWSER CONSOLE] ${msg.text()}`));
  page.on("pageerror", (err) => console.log(`[BROWSER ERROR] ${err.message}`));

  await page.goto("/booking/book/trial-flight-30", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // 1. Select Aircraft
  const aircraftBtn = page.locator("button:has-text('G-PHNX')").first();
  await expect(aircraftBtn).toBeVisible();
  await aircraftBtn.click();
  console.log("[TEST] Aircraft selected");

  // 2. Select Instructor
  const instructorBtn = page.locator("button:has-text('Andrew McKay')").first();
  await expect(instructorBtn).toBeVisible();
  await instructorBtn.click();
  console.log("[TEST] Instructor selected");

  // 3. Select a date 3 days ahead to satisfy the 24h min notice
  const dateButtons = page.locator("section:has-text('Date & Time') button, div:has-text('Date & Time') button").filter({ hasText: /Sept|Oct/i });
  const dateCount = await dateButtons.count();
  console.log(`[TEST] Date buttons found: ${dateCount}`);
  if (dateCount > 3) {
    await dateButtons.nth(3).click();
    console.log("[TEST] Clicked date button index 3 (4th day ahead)");
    await page.waitForTimeout(1000);
  }

  // 4. Select an enabled slot
  const openSlot = page.locator("button:not([disabled])").filter({ hasText: /^\d{2}:\d{2}$/ }).first();
  const slotCount = await page.locator("button:not([disabled])").filter({ hasText: /^\d{2}:\d{2}$/ }).count();
  console.log(`[TEST] Available open slots on that day: ${slotCount}`);
  if (slotCount > 0) {
    await openSlot.click();
    console.log("[TEST] Clicked open slot!");
    await page.waitForTimeout(500);
  }

  // 5. Fill customer details
  const nameInput = page.locator("label:has-text('Full name') + input, input[name='name'], input[placeholder*='name' i]").first();
  if (await nameInput.isVisible()) {
    await nameInput.fill("Jane Doe");
  }

  const emailInput = page.locator("label:has-text('Email') + input, input[type='email']").first();
  if (await emailInput.isVisible()) {
    await emailInput.fill("jane.doe@example.com");
  }

  // 6. Submit
  const submitBtn = page.getByRole("button", { name: /Continue to Confirmation|Request Booking|Confirm Booking/i });
  console.log(`[TEST] Submit button visible: ${await submitBtn.isVisible()}, disabled: ${await submitBtn.isDisabled()}`);

  if (await submitBtn.isVisible() && !await submitBtn.isDisabled()) {
    console.log("[TEST] Clicking submit button!");
    await submitBtn.click();
    await page.waitForTimeout(5000);
    console.log(`[TEST] Current URL after submit: ${page.url()}`);
    
    // Check for sonner toast or error banner
    const toast = page.locator("[data-sonner-toast], [role='status'], .text-destructive");
    if (await toast.isVisible()) {
      console.log(`[TEST ERROR TOAST]: ${await toast.textContent()}`);
    }
  }
});
