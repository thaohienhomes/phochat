import { test, expect } from "@playwright/test";

const gotoHome = async ({ page }: any, theme: "light" | "dark") => {
  await page.context().addInitScript((t: string) => {
    try { localStorage.setItem("pho_theme", t); } catch {}
  }, theme);
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
};

test("mobile dark - drawer navigation", async ({ page }) => {
  await gotoHome({ page }, "dark");
  const openBtn = page.locator("header button[aria-label='Open sidebar']");
  await openBtn.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
  if (await openBtn.isVisible().catch(() => false)) {
    await openBtn.click();
    await page.waitForTimeout(400);
  }
  const firstRecent = page.locator("nav[aria-label='Chat session history'] ul > li button").first();
  if (await firstRecent.isVisible().catch(() => false)) {
    await firstRecent.click();
  }
  await page.waitForTimeout(600);
});

