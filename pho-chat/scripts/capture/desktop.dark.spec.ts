import { test, expect } from "@playwright/test";

const gotoHome = async ({ page }: any, theme: "light" | "dark") => {
  await page.context().addInitScript((t: string) => {
    try { localStorage.setItem("pho_theme", t); } catch {}
  }, theme);
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
};

test("desktop dark - sidebar history", async ({ page }) => {
  await gotoHome({ page }, "dark");
  // Ensure sidebar visible
  const sidebar = page.locator("aside[aria-label='Chat session history']");
  await sidebar.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
  // If toggle exists, make sure it's showing
  const toggle = page.locator("header button[aria-pressed]");
  if (await toggle.isVisible().catch(() => false)) {
    const label = await toggle.textContent();
    if (label && /show sidebar/i.test(label)) {
      await toggle.click();
    }
  }
  await page.screenshot({ path: "docs/ai-chat-v2/desktop-sidebar-history-dark.png", fullPage: false });
});

test("desktop dark - sidebar toggle responsive", async ({ page }) => {
  await gotoHome({ page }, "dark");
  const toggle = page.locator("header button[aria-pressed]");
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
    await page.waitForTimeout(400);
    await toggle.click();
    await page.waitForTimeout(400);
  }
});

test("desktop dark - session selection autoscroll", async ({ page }) => {
  await gotoHome({ page }, "dark");
  const firstRecent = page.locator("nav[aria-label='Recent sessions'] ul > li button").first();
  if (await firstRecent.isVisible().catch(() => false)) {
    await firstRecent.click();
    await page.waitForTimeout(600);
  }
  const scrollBtn = page.getByRole("button", { name: /scroll to bottom/i });
  await page.mouse.wheel(0, -800).catch(() => {});
  await page.waitForTimeout(300);
  await page.mouse.wheel(0, 1600).catch(() => {});
  if (await scrollBtn.isVisible().catch(() => false)) {
    await scrollBtn.click();
  }
});

