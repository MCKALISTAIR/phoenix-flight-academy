import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://bulrhflllebnjlacxdji.supabase.co";
const supabaseAnonKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bHJoZmxsbGVibmpsYWN4ZGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwODkyMTYsImV4cCI6MjA5NDY2NTIxNn0.uk2MWb3LRSc3QFa6zX61BPhPIQioWpAKbN_iGE-Dcds";

async function cleanUpBookings() {
  const client = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await client.auth.signInWithPassword({
    email: "e2e-admin@test.lovable.dev",
    password: "TestPass!2026",
  });
  if (!data?.session) return;
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data: bookings } = await authClient.from("bookings").select("id, status");
  if (bookings && bookings.length > 0) {
    for (const b of bookings) {
      if (b.status !== "cancelled") {
        await authClient
          .from("bookings")
          .update({ status: "cancelled", cancellation_reason: "Cleaned up by E2E test run" })
          .eq("id", b.id);
      }
    }
  }
}

test.describe("Phoenix Flight Academy Smoke Tests", () => {
  test.beforeAll(async () => {
    await cleanUpBookings();
  });

  test.afterAll(async () => {
    await cleanUpBookings();
  });

  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
      if (msg.type() === "error" || msg.type() === "warning") {
        console.log(`[Browser Console ${msg.type()}] ${msg.text()}`);
      }
    });
    page.on("pageerror", (err) => {
      console.log(`[Browser PageError] ${err.message}`);
    });
    page.on("requestfailed", (req) => {
      // Don't log expected aborted requests for blocked third-party resources
      const url = req.url();
      if (
        !url.includes("fonts.googleapis.com") &&
        !url.includes("fonts.gstatic.com") &&
        !url.includes("unsplash.com")
      ) {
        console.log(`[Browser RequestFailed] ${url} - ${req.failure()?.errorText}`);
      }
    });

    // Abort third-party fonts and images to prevent slow page load and timeouts in test environment
    await page.route(/fonts\.googleapis\.com/, (route) => route.abort());
    await page.route(/fonts\.gstatic\.com/, (route) => route.abort());
    await page.route(/unsplash\.com/, (route) => route.abort());

    // Clear storage state to start fresh
    await page.context().clearCookies();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.localStorage.clear());
  });

  test("Homepage loads and contains primary headings and navigation links", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Check main hero text is present
    await expect(page.locator("h1")).toContainText("Cumbernauld Airport");

    // Check navbar contains Portal Login link
    const portalLoginLink = page.locator("nav").getByRole("link", { name: "Portal Login" });
    await expect(portalLoginLink).toBeVisible();

    // Check "Access Flight Portal" button is visible in hero
    const accessPortalBtn = page.getByRole("link", { name: "Access Flight Portal" });
    await expect(accessPortalBtn).toBeVisible();
  });

  // Public pages with updated exact headings from runtime page renders
  const publicPages = [
    { name: "About", path: "/about", heading: "Phoenix Flight Training" },
    { name: "Contact", path: "/contact", heading: "Contact Us" },
    { name: "Fleet", path: "/fleet", heading: "Our Training & Hire Fleet" },
    { name: "Privacy", path: "/privacy", heading: "Privacy Policy" },
    { name: "Terms", path: "/terms", heading: "Terms of Service" },
    { name: "Experience Flights", path: "/flying/experience", heading: "Experience Flights" },
    { name: "Learn to Fly", path: "/flying/learn-to-fly", heading: "Learn to Fly" },
    { name: "Self Hire", path: "/flying/self-hire", heading: "Self-Hire Fleet" },
    { name: "Book a Flight", path: "/booking", heading: "Book a flight" },
  ];

  for (const { name, path, heading } of publicPages) {
    test(`Public page - ${name} loads successfully`, async ({ page }) => {
      // Increase timeout per test — Vite needs extra time on cold-compilation of each route
      test.setTimeout(90000);
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1").first()).toContainText(heading);
    });
  }

  // Redirection guards verification
  const protectedPages = [
    { name: "Dashboard", path: "/booking/dashboard" },
    { name: "Ops Admin", path: "/booking/admin" },
    { name: "CMS Root", path: "/cms" },
    { name: "CMS Bookings", path: "/cms/bookings" },
    { name: "CMS Users", path: "/cms/users" },
  ];

  for (const { name, path } of protectedPages) {
    test(`Protected page - ${name} redirects to login`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForURL("**/login*");
      await expect(page).toHaveURL(/.*\/login/);
    });
  }

  test("Login Portal renders weather console and airfield status", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    // Check header
    await expect(page.locator("h1")).toContainText("Booking Portal");

    // Check Airfield Status
    await expect(page.locator("text=Cumbernauld flights are operating normally")).toBeVisible();

    // Check Live Airfield Weather Console is present
    await expect(page.locator("text=Live Airfield Weather")).toBeVisible();
    await expect(page.locator("text=Cumbernauld EGPG")).toBeVisible();

    // Toggle METAR decode button
    const decodeBtn = page.getByRole("button", { name: "Decode Weather" });
    await expect(decodeBtn).toBeVisible();
    await decodeBtn.click();
    await expect(page.getByRole("button", { name: "Show METAR" })).toBeVisible();
  });

  test("Login Portal responds to tab=register search parameter", async ({ page }) => {
    await page.goto("/login?tab=register", { waitUntil: "domcontentloaded" });

    // Verify presence of Select Your Journey Type header for registration
    await expect(page.locator("text=Select Your Journey Type")).toBeVisible();
  });

  test("Test Admin login flow redirects to CMS and walks all editor pages", async ({ page }) => {
    // Increase timeout to 90 seconds for sequentially visiting 15 CMS editor pages
    test.setTimeout(90000);

    await page.goto("/login", { waitUntil: "domcontentloaded" });

    // Click on Admin Test sign-in button
    const adminBtn = page.getByRole("button", { name: "Admin e2e-admin@test.lovable.dev" });
    await expect(adminBtn).toBeVisible();
    await adminBtn.click();

    // Should navigate to /cms overview page
    await page.waitForURL("**/cms");
    await expect(page).toHaveURL(/.*\/cms/);

    // Verify sidebar shows CMS Editor
    await expect(page.locator("aside")).toContainText("CMS Editor");

    // Click through each CMS page using client-side sidebar links to preserve session state
    const cmsSubPages = [
      { label: "Content Editor", urlPath: "/cms/content" },
      { label: "Team & Instructors", urlPath: "/cms/team" },
      { label: "Fleet & Aircraft", urlPath: "/cms/fleet" },
      { label: "Students & Logbook", urlPath: "/cms/students" },
      { label: "Expiries", urlPath: "/cms/expiries" },
      { label: "Bookings", urlPath: "/cms/bookings" },
      { label: "Booking Products", urlPath: "/cms/booking-products" },
      { label: "Calendar Settings", urlPath: "/cms/calendar-settings" },
      { label: "Closed Dates", urlPath: "/cms/closed-dates" },
      { label: "Resource Blocks", urlPath: "/cms/resource-blocks" },
      { label: "Airfield Status", urlPath: "/cms/flying-status" },
      { label: "Self-Hire Approvals", urlPath: "/cms/self-hire-approvals" },
      { label: "Mock Payments", urlPath: "/cms/mock-payments" },
      { label: "User Management", urlPath: "/cms/users" },
      { label: "System Analytics", urlPath: "/cms/analytics" },
    ];

    for (const { label, urlPath } of cmsSubPages) {
      await page.locator("aside").getByRole("link", { name: label }).click();
      await page.waitForURL(`**${urlPath}`);
      await expect(page).toHaveURL(new RegExp(urlPath));
    }
  });

  test("Test User login flow redirects to Booking Dashboard", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    // Click on User Test sign-in button
    const userBtn = page.getByRole("button", { name: "User e2e-user@test.lovable.dev" });
    await expect(userBtn).toBeVisible();
    await userBtn.click();

    // Should navigate to /booking/dashboard page
    await page.waitForURL("**/booking/dashboard");
    await expect(page).toHaveURL(/.*\/booking\/dashboard/);

    // Verify dashboard content is present (Welcome back, Alex)
    await expect(page.locator("h1").first()).toContainText("Welcome back");
  });

  test("Test student block booking flow and checkout redirect", async ({ page }) => {
    test.setTimeout(90000);
    // 1. Log in as student
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const userBtn = page.getByRole("button", { name: "User e2e-user@test.lovable.dev" });
    await expect(userBtn).toBeVisible();
    await userBtn.click();
    await page.waitForURL("**/booking/dashboard");

    // 2. Go to book a flight lesson page
    await page.goto("/booking/book/ppl-lesson", { waitUntil: "domcontentloaded" });
    await page.waitForURL("**/booking/book/ppl-lesson");

    // 3. Fill out booking form
    // Wait for the aircraft selection button to be visible, then click the first one
    const aircraftBtn = page.locator("section:has-text('Aircraft') button").first();
    await expect(aircraftBtn).toBeVisible();
    await aircraftBtn.click();

    // Click the first instructor button
    const instructorBtn = page.locator("section:has-text('Instructor') button").first();
    await expect(instructorBtn).toBeVisible();
    await instructorBtn.click();

    // Select the second date button (tomorrow) which will have availability
    const dateBtn = page.locator("section:has-text('Date & time') button").nth(1);
    await expect(dateBtn).toBeVisible();
    await dateBtn.click();

    // Wait for slot loading/times to be visible and select the first available time slot button
    // Use data-testid to precisely target the slot grid (not the date picker buttons above it)
    const slotBtn = page.locator("[data-testid='slot-grid'] button:not([disabled])").first();
    await expect(slotBtn).toBeVisible({ timeout: 15000 });
    await slotBtn.click();

    // Now set recurrence to weekly
    const patternSelect = page.locator("label:has-text('Schedule Pattern') + select");
    await expect(patternSelect).toBeVisible();
    await patternSelect.selectOption("weekly");

    // Set occurrences count to 5 lessons
    const occurrencesSelect = page.locator("label:has-text('Number of Lessons') + select");
    await expect(occurrencesSelect).toBeVisible();
    await occurrencesSelect.selectOption("5");

    // Fill out customer details
    await page.locator("label:has-text('Full name') + input").fill("Alex Student");
    await page.locator("label:has-text('Email') + input").fill("e2e-user@test.lovable.dev");

    // Submit booking
    const submitBtn = page.getByRole("button", { name: "Request booking" });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // ppl-lesson uses payment_mode=invoice — no upfront payment, so the app
    // routes to /booking/confirm (not /booking/checkout).
    await page.waitForURL("**/booking/confirm/*", { timeout: 30000 });
    await expect(page).toHaveURL(/.*\/booking\/confirm\/.*/);

    // Verify the confirmation page acknowledges the booking
    await expect(page.locator("h1").first()).toContainText("Booking received");
    await expect(page.locator("text=PPL Training Lesson")).toBeVisible();
  });
});
