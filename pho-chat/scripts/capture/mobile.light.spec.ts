import { test, expect } from "@playwright/test";

const gotoHome = async ({ page }: any, theme: "light" | "dark") => {
  await page.context().addInitScript((t: string) => {
    try { localStorage.setItem("pho_theme", t); } catch {}
  }, theme);
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
};

test("mobile light - drawer navigation", async ({ page }) => {
  await gotoHome({ page }, "light");
  const openBtn = page.getByRole("button", { name: /open sidebar/i });
  await openBtn.click();
  await page.waitForTimeout(400);
  // Click a recent item if available
  const firstRecent = page.locator("nav[aria-label='Chat session history'] ul > li button").first();
  if (await firstRecent.isVisible().catch(() => false)) {
    await firstRecent.click();
  }
  await page.waitForTimeout(600);
});

