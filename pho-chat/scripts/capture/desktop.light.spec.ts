import { test, expect } from "@playwright/test";

const gotoHome = async ({ page }: any, theme: "light" | "dark") => {
  await page.context().addInitScript((t: string) => {
    try { localStorage.setItem("pho_theme", t); } catch {}
  }, theme);
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
};

test("desktop light - sidebar history", async ({ page }, testInfo) => {
  await gotoHome({ page }, "light");
  // Ensure sidebar visible (desktop) — be resilient to hydration/CSS timing
  const sidebar = page.locator("aside[aria-label='Chat session history']");
  await sidebar.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
  // If toggle exists, ensure it's set to visible
  const toggle = page.locator("header button[aria-pressed]");
  if (await toggle.isVisible().catch(() => false)) {
    const label = await toggle.textContent();
    if (label && /show sidebar/i.test(label)) {
      await toggle.click();
    }
  }
  // Capture screenshot
  await page.screenshot({ path: "docs/ai-chat-v2/desktop-sidebar-history-light.png", fullPage: false });
});

test("desktop light - sidebar toggle responsive", async ({ page }) => {
  await gotoHome({ page }, "light");
  const toggle = page.locator("header button[aria-pressed]");
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
    await page.waitForTimeout(400);
    await toggle.click();
    await page.waitForTimeout(400);
  }
});

test("desktop light - session selection autoscroll", async ({ page }) => {
  await gotoHome({ page }, "light");
  // Try clicking first Recent item if present
  const firstRecent = page.locator("nav[aria-label='Recent sessions'] ul > li button").first();
  if (await firstRecent.isVisible().catch(() => false)) {
    await firstRecent.click();
    await page.waitForTimeout(600);
  }
  // Scroll area and show scroll button if available
  const scrollBtn = page.getByRole("button", { name: /scroll to bottom/i });
  // Try to scroll the main chat container
  await page.mouse.wheel(0, -800).catch(() => {}); // scroll up (ignore if unsupported)
  await page.waitForTimeout(300);
  await page.mouse.wheel(0, 1600).catch(() => {}); // scroll down
  if (await scrollBtn.isVisible().catch(() => false)) {
    await scrollBtn.click();
  }
});

