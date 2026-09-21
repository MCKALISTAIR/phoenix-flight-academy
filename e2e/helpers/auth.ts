import { expect, type Page } from "@playwright/test";

/** Seeded Supabase accounts used by Playwright. Not shown on production login. */
export const E2E_ACCOUNTS = {
  admin: {
    email: "e2e-admin@test.lovable.dev",
    password: "TestPass!2026",
  },
  user: {
    email: "e2e-user@test.lovable.dev",
    password: "TestPass!2026",
  },
} as const;

/**
 * Sign in through the normal email/password form.
 * Prefer this over demo Quick Sign-In buttons so tests work when demo UI is gated off.
 */
export async function signInUI(page: Page, email: string, password: string) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.localStorage.removeItem("pfa_dev_role");
    window.localStorage.removeItem("pfa_dev_email");
  });
  await page.locator("#loginEmail").fill(email);
  await page.locator("#loginPass").fill(password);
  await page.getByRole("button", { name: "Sign In to Flight Portal" }).click();
}

export async function signInAsAdmin(page: Page) {
  await signInUI(page, E2E_ACCOUNTS.admin.email, E2E_ACCOUNTS.admin.password);
  await page.waitForURL("**/cms**", { timeout: 20000 });
  await expect(page).toHaveURL(/\/cms/);
}

export async function signInAsUser(page: Page) {
  await signInUI(page, E2E_ACCOUNTS.user.email, E2E_ACCOUNTS.user.password);
  await page.waitForURL("**/booking/dashboard**", { timeout: 20000 });
  await expect(page).toHaveURL(/\/booking\/dashboard/);
}
