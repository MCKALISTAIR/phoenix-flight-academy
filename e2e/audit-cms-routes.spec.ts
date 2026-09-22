import { test, expect } from "@playwright/test";
import { signInAsAdmin } from "./helpers/auth";

test("Audit all CMS and Staff console pages for runtime crashes", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const serverErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });
  page.on("response", (res) => {
    if (res.status() >= 500) {
      serverErrors.push(`${res.url()} -> Status ${res.status()}`);
    }
  });

  await signInAsAdmin(page);
  const routesToAudit = [
    { name: "Overview", path: "/cms" },
    { name: "Bookings", path: "/cms/bookings" },
    { name: "Payments & Balances", path: "/admin/bookings" },
    { name: "Enquiries & Leads", path: "/cms/enquiries" },
    { name: "Airfield Status", path: "/cms/flying-status" },
    { name: "Resource Blocks", path: "/cms/resource-blocks" },
    { name: "Closed Dates", path: "/cms/closed-dates" },
    { name: "Students & Logbook", path: "/cms/students" },
    { name: "Expiries", path: "/cms/expiries" },
    { name: "Self-Hire Approvals", path: "/cms/self-hire-approvals" },
    { name: "Pilot Verifications", path: "/cms/pilot-verifications" },
    { name: "Fleet & Aircraft", path: "/cms/fleet" },
    { name: "Booking Products", path: "/cms/booking-products" },
    { name: "Calendar Settings", path: "/cms/calendar-settings" },
    { name: "Promotions", path: "/cms/promotions" },
    { name: "Emails", path: "/cms/emails" },
    { name: "Content", path: "/cms/content" },
    { name: "Users", path: "/cms/users" },
  ];

  for (const r of routesToAudit) {
    console.log(`\n--- Auditing CMS Route: ${r.name} (${r.path}) ---`);
    const link = page.locator("aside").getByRole("link", { name: r.name });
    if (await link.isVisible()) {
      await link.click();
      await page.waitForTimeout(1500);
      const url = page.url();
      console.log(`[AUDIT] Resulting URL: ${url}`);
      if (url.includes("/login")) {
        console.log(`[CRITICAL AUDIT FAILURE] ${r.name} redirected to /login!`);
      }
      
      const toast = page.locator("[data-sonner-toast]").filter({ hasText: /error|unauthorized|failed/i });
      if (await toast.count() > 0) {
        console.log(`[AUDIT TOAST ERROR on ${r.name}]: ${await toast.first().textContent()}`);
      }
    } else {
      console.log(`[AUDIT] Link not visible in sidebar for ${r.name}`);
    }
  }

  console.log("\n=== AUDIT SUMMARY ===");
  console.log(`Total Console Errors: ${consoleErrors.length}`);
  console.log(`Total Page Errors: ${pageErrors.length}`);
  console.log(`Total Server 500 Responses: ${serverErrors.length}`);
  if (serverErrors.length > 0) {
    console.log("500 responses:", serverErrors);
  }
  if (pageErrors.length > 0) {
    console.log("Page errors:", pageErrors);
  }
});
