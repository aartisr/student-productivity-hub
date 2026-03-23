import { expect, test } from "@playwright/test";

test.describe("Responsive visual baselines", () => {
  test("home shell matches visual baseline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Student Productivity Hub" })).toBeVisible();

    await expect(page).toHaveScreenshot("home-shell.png", {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01,
    });
  });

  test("auth panel matches visual baseline", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Auth", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Welcome to Student Productivity Hub" })).toBeVisible();

    await expect(page).toHaveScreenshot("auth-panel.png", {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01,
    });
  });
});
