import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "/Users/alistair.mckay/.gemini/antigravity/brain/330f65e4-35d6-4a0b-8d1a-f34fda81a8ba/screenshots";

async function saveShot(page: any, name: string) {
  try {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
    const fullPath = path.join(SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({ path: fullPath, fullPage: false });
    console.log(`[WATCH SCREENSHOT] Saved: ${name}.png`);
  } catch (err) {
    console.error(`Failed to save screenshot ${name}:`, err);
  }
}

test.describe("Phoenix Flight Academy - Visual Chrome Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept slow 3rd party resources for snappy UI rendering
    await page.route(/fonts\.googleapis\.com/, (route) => route.abort());
    await page.route(/fonts\.gstatic\.com/, (route) => route.abort());
    await page.route(/unsplash\.com/, (route) => route.abort());

    await page.context().clearCookies();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.localStorage.clear());
  });

  test("Journey 1: Homepage, Bento Pathway exploration, and POH Specs Modal", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await saveShot(page, "01_homepage_hero");

    // Click through Bento Pathway tabs
    console.log("[WATCH] Switching to Learn to Fly pathway tab...");
    const learnTab = page.getByRole("tab", { name: "Learn to Fly" });
    await learnTab.click();
    await page.waitForTimeout(1000);
    await saveShot(page, "02_pathway_learn_to_fly");

    console.log("[WATCH] Switching to Hire an Aircraft pathway tab...");
    const hireTab = page.getByRole("tab", { name: "Hire an Aircraft" });
    await hireTab.click();
    await page.waitForTimeout(1000);
    await saveShot(page, "03_pathway_hire_aircraft");

    // Open Technical POH Specs Modal
    console.log("[WATCH] Opening Technical POH Specs modal...");
    const pohBtn = page.getByRole("button", { name: /View Technical POH Specs/i });
    await expect(pohBtn).toBeVisible();
    await pohBtn.click();
    await page.waitForTimeout(1000);
    await saveShot(page, "04_poh_specs_modal");

    // Close Modal
    const closeBtn = page.locator("[role='dialog'] button").filter({ hasText: /Close|×/i }).or(page.locator("button[aria-label='Close']"));
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    } else {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });

  test("Journey 2: Booking Selection and Trial Flight Booking Screen", async ({ page }) => {
    console.log("[WATCH] Navigating to Booking catalog...");
    await page.goto("/booking", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await saveShot(page, "05_booking_catalog");

    // Click 30-minute trial flight
    console.log("[WATCH] Selecting 30-Minute Trial Flight...");
    const trialLink = page.getByRole("link", { name: /30-Minute Trial Flight/i });
    await expect(trialLink).toBeVisible();
    await trialLink.click();

    await page.waitForURL("**/booking/book/trial-flight-30", { timeout: 15000 });
    await page.waitForTimeout(1500);
    await saveShot(page, "06_trial_flight_booking_step1");

    // Check available aircraft buttons
    const aircraftBtn = page.locator("section:has-text('Aircraft') button, div:has-text('Aircraft') button").first();
    if (await aircraftBtn.isVisible()) {
      console.log("[WATCH] Inspecting aircraft selection...");
      await aircraftBtn.click();
      await page.waitForTimeout(600);
    }

    // Inspect date & time section
    console.log("[WATCH] Inspecting booking schedule...");
    const openSlot = page.locator("button:not([disabled])").filter({ hasText: /^\d{2}:\d{2}$/ }).first();
    if (await openSlot.isVisible()) {
      console.log("[WATCH] Selecting open time slot...");
      await openSlot.click();
      await page.waitForTimeout(1000);
      await saveShot(page, "07_slot_selected");
    } else {
      console.log("[WATCH] Today's slots are occupied or locked; captured schedule state cleanly.");
      await saveShot(page, "07_schedule_state");
    }
  });

  test("Journey 3: Customer Self-Service Guest Booking Lookup", async ({ page }) => {
    console.log("[WATCH] Navigating to Booking Lookup (/booking/lookup)...");
    await page.goto("/booking/lookup", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await saveShot(page, "08_booking_lookup_screen");

    // Fill booking reference and email
    console.log("[WATCH] Entering lookup credentials...");
    const refInput = page.locator('input[placeholder*="receipt email"], input#bookingId, input[name="bookingId"]').first();
    await expect(refInput).toBeVisible();
    await refInput.fill("8a7c2b3d-e4f5-4678-9012-3456789abcde");
    await page.waitForTimeout(600);

    const emailInput = page.locator('input[type="email"], input[placeholder*="example"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill("pilot-candidate@example.co.uk");
      await page.waitForTimeout(600);
    }

    const lookupBtn = page.getByRole("button", { name: /Look Up Booking|Find Booking/i });
    await expect(lookupBtn).toBeVisible();
    await lookupBtn.click();
    await page.waitForTimeout(1500);
    await saveShot(page, "09_booking_lookup_result");
  });

  test("Journey 4: Airfield Weather Console & Cumbernauld Status", async ({ page }) => {
    console.log("[WATCH] Navigating to Login Portal for Airfield Weather...");
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    await saveShot(page, "10_portal_weather_console");

    // Toggle METAR decode
    const decodeBtn = page.getByRole("button", { name: "Decode Weather" });
    if (await decodeBtn.isVisible()) {
      console.log("[WATCH] Clicking 'Decode Weather' button...");
      await decodeBtn.click();
      await page.waitForTimeout(1000);
      await saveShot(page, "11_weather_decoded");
    }
  });

  test("Journey 5: Staff Login & All Bookings / Payments Console (/admin/bookings)", async ({ page }) => {
    console.log("[WATCH] Logging in as Admin...");
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const adminBtn = page.getByRole("button", { name: /Admin/i }).filter({ hasText: /Admin/i }).first();
    await expect(adminBtn).toBeVisible();
    await adminBtn.click();

    await page.waitForURL("**/cms**", { timeout: 15000 });
    await page.waitForTimeout(1500);
    await saveShot(page, "12_cms_dashboard");

    // Navigate to the newly added /admin/bookings route via client-side sidebar link
    console.log("[WATCH] Navigating to Payments & Balances via sidebar (/admin/bookings)...");
    const paymentsLink = page.locator("aside").getByRole("link", { name: /Payments & Balances/i });
    await expect(paymentsLink).toBeVisible();
    await paymentsLink.click();
    await page.waitForURL("**/admin/bookings", { timeout: 15000 });
    await page.waitForTimeout(2000);
    await saveShot(page, "13_admin_bookings_console");

    // Switch payment filter tabs
    console.log("[WATCH] Filtering by 'Unpaid'...");
    const unpaidBtn = page.getByRole("button", { name: "Unpaid", exact: true });
    if (await unpaidBtn.isVisible()) {
      await unpaidBtn.click();
      await page.waitForTimeout(1000);
      await saveShot(page, "14_admin_bookings_unpaid_filter");
    }

    console.log("[WATCH] Filtering by 'Paid'...");
    const paidBtn = page.getByRole("button", { name: "Paid", exact: true });
    if (await paidBtn.isVisible()) {
      await paidBtn.click();
      await page.waitForTimeout(1000);
      await saveShot(page, "15_admin_bookings_paid_filter");
    }

    console.log("[WATCH] Filtering by 'All'...");
    const allBtn = page.getByRole("button", { name: "All", exact: true });
    if (await allBtn.isVisible()) {
      await allBtn.click();
      await page.waitForTimeout(1000);
      await saveShot(page, "16_admin_bookings_all_filter");
    }
  });
});
