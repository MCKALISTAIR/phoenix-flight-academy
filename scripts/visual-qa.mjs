/**
 * Visual QA screenshot pass for Phoenix Flight Academy.
 * Captures mobile + desktop, light + dark, key public/auth surfaces.
 */
import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE = process.env.VQA_BASE || "http://localhost:5173";
const OUT = process.env.VQA_OUT || "/opt/cursor/artifacts/screenshots";
const PASS = join(OUT, "pass");
const ISSUES = join(OUT, "issues");

mkdirSync(PASS, { recursive: true });
mkdirSync(ISSUES, { recursive: true });

const publicRoutes = [
  ["home", "/"],
  ["about", "/about"],
  ["contact", "/contact"],
  ["fleet", "/fleet"],
  ["experience", "/flying/experience"],
  ["learn-to-fly", "/flying/learn-to-fly"],
  ["self-hire", "/flying/self-hire"],
  ["booking", "/booking"],
  ["booking-lookup", "/booking/lookup"],
  ["login", "/login"],
  ["register", "/login?tab=register"],
  ["privacy", "/privacy"],
  ["terms", "/terms"],
];

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem("theme", t);
  }, theme);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
}

async function shot(page, name) {
  const path = join(PASS, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function fullShot(page, name) {
  const path = join(PASS, `${name}-full.png`);
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function measureTouchTargets(page) {
  return page.evaluate(() => {
    const interactive = Array.from(
      document.querySelectorAll("a, button, [role='button'], input, select, summary"),
    );
    const small = [];
    for (const el of interactive) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.width < 44 || r.height < 44) {
        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none") continue;
        small.push({
          tag: el.tagName.toLowerCase(),
          text: (el.innerText || el.getAttribute("aria-label") || el.getAttribute("href") || "")
            .slice(0, 60)
            .replace(/\s+/g, " "),
          w: Math.round(r.width),
          h: Math.round(r.height),
          x: Math.round(r.x),
          y: Math.round(r.y),
        });
      }
    }
    return small.slice(0, 40);
  });
}

async function checkOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const bodyOverflow = document.body.scrollWidth > doc.clientWidth + 2;
    const clipped = [];
    for (const el of document.querySelectorAll("h1, h2, p, span, a, button, td, th, li")) {
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
        const text = (el.innerText || "").slice(0, 80).replace(/\s+/g, " ");
        if (!text.trim()) continue;
        clipped.push({
          tag: el.tagName.toLowerCase(),
          text,
          scrollW: el.scrollWidth,
          clientW: el.clientWidth,
        });
      }
    }
    return { bodyOverflow, clipped: clipped.slice(0, 25) };
  });
}

async function walkPublic(page, label) {
  const notes = [];
  for (const [name, path] of publicRoutes) {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(600);
    await shot(page, `${label}-${name}`);
    if (["home", "login", "booking", "fleet"].includes(name)) {
      await fullShot(page, `${label}-${name}`);
    }
    const overflow = await checkOverflow(page);
    const touches = await measureTouchTargets(page);
    if (overflow.bodyOverflow || overflow.clipped.length || touches.length) {
      notes.push({ route: path, overflow, touches: touches.slice(0, 15) });
    }
  }

  // Mobile menu on home
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  const menuBtn = page.locator("header button").filter({ has: page.locator("svg") }).first();
  if (await menuBtn.isVisible().catch(() => false)) {
    await menuBtn.click();
    await page.waitForTimeout(400);
    await shot(page, `${label}-home-mobile-menu`);
  }

  // Login weather decode
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const decode = page.getByRole("button", { name: /Decode Weather|Show METAR/i });
  if (await decode.first().isVisible().catch(() => false)) {
    await decode.first().click();
    await page.waitForTimeout(400);
    await shot(page, `${label}-login-weather-toggled`);
  }

  // Password reset if present
  const forgot = page.getByRole("button", { name: /forgot|reset/i }).or(
    page.getByRole("link", { name: /forgot|reset/i }),
  );
  if (await forgot.first().isVisible().catch(() => false)) {
    await forgot.first().click();
    await page.waitForTimeout(400);
    await shot(page, `${label}-login-password-reset`);
    await page.keyboard.press("Escape").catch(() => {});
  }

  return notes;
}

async function loginAndCapture(page, buttonName, afterLabel, routes) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  const btn = page.getByRole("button", { name: buttonName });
  await btn.click();
  await page.waitForTimeout(2000);
  for (const [name, path] of routes) {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(800);
    await shot(page, afterLabel + "-" + name);
    if (name.includes("cms") || name.includes("dashboard")) {
      await fullShot(page, afterLabel + "-" + name);
    }
  }
}

async function runViewport(browser, deviceName, viewport, isMobile) {
  const context = await browser.newContext({
    viewport,
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  const allNotes = { light: [], dark: [] };

  // Light
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await setTheme(page, "light");
  allNotes.light = await walkPublic(page, `${deviceName}-light`);

  // Dark on key screens
  await setTheme(page, "dark");
  for (const [name, path] of [
    ["home", "/"],
    ["login", "/login"],
    ["booking", "/booking"],
    ["fleet", "/fleet"],
    ["contact", "/contact"],
  ]) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await shot(page, `${deviceName}-dark-${name}`);
  }
  await setTheme(page, "light");

  // User auth
  try {
    await loginAndCapture(page, /User e2e-user@test\.lovable\.dev/, `${deviceName}-user`, [
      ["dashboard", "/booking/dashboard"],
      ["account", "/account"],
    ]);
  } catch (e) {
    console.error("User login failed", e.message);
  }

  // Sign out via storage clear then admin
  await context.clearCookies();
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  try {
    await loginAndCapture(page, /Admin e2e-admin@test\.lovable\.dev/, `${deviceName}-admin`, [
      ["cms", "/cms"],
      ["cms-day-sheet", "/cms/day-sheet"],
      ["cms-bookings", "/cms/bookings"],
      ["cms-students", "/cms/students"],
      ["cms-expiries", "/cms/expiries"],
      ["cms-calendar-settings", "/cms/calendar-settings"],
      ["cms-users", "/cms/users"],
    ]);
  } catch (e) {
    console.error("Admin login failed", e.message);
  }

  // Dark CMS sample
  await page.evaluate(() => localStorage.setItem("theme", "dark"));
  await page.goto(BASE + "/cms/bookings", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(800);
  await shot(page, `${deviceName}-dark-cms-bookings`);

  await context.close();
  return allNotes;
}

const browser = await chromium.launch({ headless: true });
console.log("Starting mobile pass…");
const mobileNotes = await runViewport(browser, "mobile", { width: 390, height: 844 }, true);
console.log("Starting desktop pass…");
const desktopNotes = await runViewport(browser, "desktop", { width: 1280, height: 800 }, false);
await browser.close();

const report = { mobileNotes, desktopNotes, out: OUT };
console.log(JSON.stringify(report, null, 2));
import { writeFileSync } from "fs";
writeFileSync(join(OUT, "automation-notes.json"), JSON.stringify(report, null, 2));
console.log("Done. Screenshots in", OUT);
