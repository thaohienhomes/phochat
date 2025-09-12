import { test, expect } from "@playwright/test";

const gotoHome = async ({ page }: any, theme: "light" | "dark") => {
  await page.context().addInitScript((t: string) => {
    try { localStorage.setItem("pho_theme", t); } catch {}
  }, theme);
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
};

test("desktop light - sidebar history", async ({ page }) => {
  await gotoHome({ page }, "light");
  // Ensure sidebar visible (desktop)
  const toggle = page.getByRole("button", { name: /hide sidebar|show sidebar/i });
  await expect(toggle).toBeVisible();
  // If hidden, show it
  const label = await toggle.textContent();
  if (label && /show sidebar/i.test(label)) {
    await toggle.click();
  }
  // Capture screenshot
  await page.screenshot({ path: "docs/ai-chat-v2/desktop-sidebar-history-light.png", fullPage: false });
});

test("desktop light - sidebar toggle responsive", async ({ page }) => {
  await gotoHome({ page }, "light");
  const toggle = page.getByRole("button", { name: /hide sidebar|show sidebar/i });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await page.waitForTimeout(400);
  await toggle.click();
  await page.waitForTimeout(400);
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
  await page.mouse.wheel(0, -800); // scroll up
  await page.waitForTimeout(300);
  await page.mouse.wheel(0, 1600); // scroll down
  if (await scrollBtn.isVisible().catch(() => false)) {
    await scrollBtn.click();
  }
});

