import { test, expect } from "@playwright/test";

test("Customer attempts to submit contact enquiry on /contact", async ({ page }) => {
  page.on("console", (msg) => console.log(`[BROWSER CONSOLE] ${msg.text()}`));
  page.on("pageerror", (err) => console.log(`[BROWSER ERROR] ${err.message}`));

  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // Fill in form
  await page.fill("#name", "Captain Arthur Dent");
  await page.fill("#email", "arthur@earth.co.uk");
  await page.fill("#message", "I would like to enquire about trial flight gift vouchers for my family.");

  const submitBtn = page.getByRole("button", { name: /Submit.*Inquiry|Send Message/i });
  await expect(submitBtn).toBeVisible();
  console.log("[TEST] Submitting contact enquiry form...");
  await submitBtn.click();

  await page.waitForTimeout(4000);

  const toast = page.locator("[data-sonner-toast], [role='status'], .text-destructive");
  if (await toast.isVisible()) {
    console.log(`[CONTACT TEST TOAST]: ${await toast.textContent()}`);
  }

  const confirmation = page.locator("text=Message Received!, text=Thank you, text=received your message");
  console.log(`[CONTACT CONFIRMATION VISIBLE]: ${await confirmation.isVisible()}`);
});
