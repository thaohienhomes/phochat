import { defineConfig, devices } from "@playwright/test";

const PREVIEW_URL = process.env.PREVIEW_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./scripts/capture",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: PREVIEW_URL,
    screenshot: "on",
    video: "on",
    trace: "off",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "iphone-15-pro",
      use: { ...devices["iPhone 15 Pro"] },
    },
  ],
});

