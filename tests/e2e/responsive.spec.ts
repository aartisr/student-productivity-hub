import { expect, test } from "@playwright/test";

test.describe("Responsive shell", () => {
  test("renders core sections without horizontal overflow", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Student Productivity Hub" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Auth", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Assignments" })).toBeVisible();

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth > root.clientWidth + 1;
    });

    expect(overflow).toBeFalsy();
  });

  test("protected tabs redirect guests to auth", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Pomodoro" }).click();
    await expect(page.getByRole("heading", { name: "Welcome to Student Productivity Hub" })).toBeVisible();
    await expect(page.getByText("Sign in to access this module.")).toBeVisible();

    await page.getByRole("button", { name: "Analytics" }).click();
    await expect(page.getByRole("heading", { name: "Welcome to Student Productivity Hub" })).toBeVisible();

    await page.getByRole("button", { name: "Export/Backup" }).click();
    await expect(page.getByRole("heading", { name: "Welcome to Student Productivity Hub" })).toBeVisible();
  });
});
