import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "line",
  timeout: 60000, // Increase test timeout to 60s to handle Vite compilation in dev server
  use: {
    baseURL: "http://localhost:8083",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 8083",
    port: 8083,
    reuseExistingServer: true,
    timeout: 90000,
  },
});
