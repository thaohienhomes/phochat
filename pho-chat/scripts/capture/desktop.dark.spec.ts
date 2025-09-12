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
  const toggle = page.getByRole("button", { name: /hide sidebar|show sidebar/i });
  await expect(toggle).toBeVisible();
  const label = await toggle.textContent();
  if (label && /show sidebar/i.test(label)) {
    await toggle.click();
  }
  await page.screenshot({ path: "docs/ai-chat-v2/desktop-sidebar-history-dark.png", fullPage: false });
});

test("desktop dark - sidebar toggle responsive", async ({ page }) => {
  await gotoHome({ page }, "dark");
  const toggle = page.getByRole("button", { name: /hide sidebar|show sidebar/i });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await page.waitForTimeout(400);
  await toggle.click();
  await page.waitForTimeout(400);
});

test("desktop dark - session selection autoscroll", async ({ page }) => {
  await gotoHome({ page }, "dark");
  const firstRecent = page.locator("nav[aria-label='Recent sessions'] ul > li button").first();
  if (await firstRecent.isVisible().catch(() => false)) {
    await firstRecent.click();
    await page.waitForTimeout(600);
  }
  const scrollBtn = page.getByRole("button", { name: /scroll to bottom/i });
  await page.mouse.wheel(0, -800);
  await page.waitForTimeout(300);
  await page.mouse.wheel(0, 1600);
  if (await scrollBtn.isVisible().catch(() => false)) {
    await scrollBtn.click();
  }
});

