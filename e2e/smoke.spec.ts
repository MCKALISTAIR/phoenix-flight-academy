import { test, expect } from "@playwright/test";

test.describe("Phoenix Flight Academy Smoke Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage state to start fresh
    await page.context().clearCookies();
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
    { name: "Book a Flight", path: "/booking", heading: "Book a flight" }
  ];

  for (const { name, path, heading } of publicPages) {
    test(`Public page - ${name} loads successfully`, async ({ page }) => {
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
    { name: "CMS Users", path: "/cms/users" }
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
      { label: "System Analytics", urlPath: "/cms/analytics" }
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
});
