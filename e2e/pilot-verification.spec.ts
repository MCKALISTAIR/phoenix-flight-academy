import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://bulrhflllebnjlacxdji.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TEST_EMAIL = `e2e-pilot-${Date.now()}@test.lovable.dev`;
const TEST_PASSWORD = "TestPass!2026";
const DISPLAY_NAME = "E2E Pilot Candidate";
const LICENCE = `E2E-${Date.now()}`;

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function deleteUserByEmail(email: string) {
  const { data } = await admin.auth.admin.listUsers();
  const u = data.users.find((x) => x.email === email);
  if (u) await admin.auth.admin.deleteUser(u.id);
}

async function signInUI(page: Page, email: string, password: string) {
  await page.context().clearCookies();
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.locator("#loginEmail").fill(email);
  await page.locator("#loginPass").fill(password);
  await page.getByRole("button", { name: /sign in to portal|sign in/i }).first().click();
}

test.describe("Pilot verification end-to-end", () => {
  let userId: string;

  test.beforeAll(async () => {
    await deleteUserByEmail(TEST_EMAIL);
    const { data, error } = await admin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: DISPLAY_NAME },
    });
    if (error) throw error;
    userId = data.user!.id;
  });

  test.afterAll(async () => {
    // Wipe verification rows, profiles, storage objects, then user.
    await admin.from("pilot_verification_requests").delete().eq("user_id", userId);
    await admin.from("self_hire_approvals").delete().eq("user_id", userId);
    await admin.from("customer_profiles").delete().eq("user_id", userId);
    const { data: files } = await admin.storage.from("pilot-documents").list(userId);
    if (files?.length) {
      await admin.storage
        .from("pilot-documents")
        .remove(files.map((f) => `${userId}/${f.name}`));
    }
    await deleteUserByEmail(TEST_EMAIL);
  });

  test.beforeEach(async ({ page }) => {
    page.on("pageerror", (err) => console.log(`[PageError] ${err.message}`));
    await page.route(/fonts\.googleapis\.com|fonts\.gstatic\.com|unsplash\.com/, (r) => r.abort());
  });

  test("customer submits verification, admin approves, tier becomes pilot", async ({ page }) => {
    test.setTimeout(120_000);

    // ---- 1. Customer signs in and submits pilot verification with uploads ----
    await signInUI(page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForURL("**/booking/dashboard", { timeout: 20_000 });

    await page.goto("/account", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText("My Account");
    await expect(page.getByText("No tier yet")).toBeVisible();

    // Fill the verification form (rendered when tier is null and no pending request)
    await page.locator('input[maxlength="64"]').first().fill(LICENCE);
    // issuing authority already defaults to "UK CAA"
    await page.locator('textarea').first().fill("SEP (Land), Night");

    // Upload licence + medical documents
    const fileInputs = page.locator('input[type="file"]');
    await fileInputs.nth(0).setInputFiles({
      name: "licence.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 fake licence document for e2e"),
    });
    await fileInputs.nth(1).setInputFiles({
      name: "medical.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 fake medical document for e2e"),
    });

    await page.getByRole("button", { name: /submit for verification/i }).click();

    // Pending state appears
    await expect(page.getByText("Verification pending")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(`text=${LICENCE}`)).toBeVisible();

    // ---- 2. Admin signs in and approves the request ----
    await signInUI(page, "e2e-admin@test.lovable.dev", "TestPass!2026");
    await page.waitForURL("**/cms", { timeout: 20_000 });

    await page.goto("/cms/pilot-verifications", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText("Pilot Verifications");

    // Locate the article containing our licence number
    const card = page.locator("article", { hasText: LICENCE });
    await expect(card).toBeVisible({ timeout: 15_000 });

    // Both document buttons should be present (uploads succeeded)
    await expect(card.getByRole("button", { name: /licence document/i })).toBeVisible();
    await expect(card.getByRole("button", { name: /medical document/i })).toBeVisible();

    await card
      .locator("input[placeholder*='Review notes']")
      .fill("Approved by e2e test");
    await card.getByRole("button", { name: /approve & grant self-hire/i }).click();

    // Card moves out of "pending" tab — expect empty state or card to be gone
    await expect(card).toBeHidden({ timeout: 15_000 });

    // ---- 3. Customer signs back in; tier is now Pilot ----
    await signInUI(page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForURL("**/booking/dashboard", { timeout: 20_000 });
    await page.goto("/account", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Pilot" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/cleared for self-hire bookings/i)).toBeVisible();

    // ---- 4. DB-level sanity checks via service role ----
    const profile = await admin
      .from("customer_profiles")
      .select("tier, qualified_at")
      .eq("user_id", userId)
      .maybeSingle();
    expect(profile.data?.tier).toBe("pilot");
    expect(profile.data?.qualified_at).toBeTruthy();

    const selfHire = await admin
      .from("self_hire_approvals")
      .select("id, revoked_at")
      .eq("user_id", userId)
      .is("revoked_at", null)
      .maybeSingle();
    expect(selfHire.data?.id).toBeTruthy();
  });
});