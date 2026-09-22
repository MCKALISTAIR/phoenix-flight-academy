import { expect, type Page } from "@playwright/test";

/**
 * Seeded Supabase accounts (see src/lib/test-auth.functions.ts).
 * Playwright uses the normal email/password form — not demo Quick Sign-In buttons.
 */
export const E2E_ACCOUNTS = {
  admin: {
    email: "admin@test.local",
    password: "TestAdmin123!",
  },
  user: {
    email: "user@test.local",
    password: "TestUser123!",
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
  // Second load after clearing storage; wait for network so the login form is hydrated.
  await page.goto("/login", { waitUntil: "networkidle" });

  const emailInput = page.locator("#loginEmail");
  const passwordInput = page.locator("#loginPass");
  const submit = page.getByRole("button", { name: "Sign In to Flight Portal" });

  await expect(emailInput).toBeVisible();
  await expect(submit).toBeEnabled();

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await submit.click();

  // If the page wasn't hydrated yet, a native form navigation can occur.
  // Retry once after a full network-idle load.
  if (page.url().includes("/login?") || page.url().endsWith("/login#")) {
    await page.goto("/login", { waitUntil: "networkidle" });
    await expect(emailInput).toBeVisible();
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submit.click();
  }
}

export async function signInAsAdmin(page: Page) {
  await signInUI(page, E2E_ACCOUNTS.admin.email, E2E_ACCOUNTS.admin.password);
  await page.waitForURL("**/cms**", { timeout: 30000 });
  await expect(page).toHaveURL(/\/cms/);
}

export async function signInAsUser(page: Page) {
  await signInUI(page, E2E_ACCOUNTS.user.email, E2E_ACCOUNTS.user.password);
  await page.waitForURL("**/booking/dashboard**", { timeout: 30000 });
  await expect(page).toHaveURL(/\/booking\/dashboard/);
}
