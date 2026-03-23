import { expect, test } from "@playwright/test";

test.describe("Role-based access control", () => {
  test("student role sees access denied panels for instructor-only quiz sections", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            name: "Student User",
            email: "student@example.com",
            role: "student",
            id: "student-1",
          },
          expires: "2099-01-01T00:00:00.000Z",
        }),
      });
    });

    await page.goto("/");

    await expect(page.getByText("student@example.com")).toBeVisible();
    await expect(page.getByText("STUDENT").first()).toBeVisible();

    await page.getByRole("button", { name: "Quiz Lab" }).click();

    await expect(page.getByRole("heading", { name: "LMS Connector Access", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Instructor Mode Access", exact: true })).toBeVisible();

    await expect(page.getByRole("heading", { name: "LMS Connector Stubs (Dry-Run)", exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Instructor Mode", exact: true })).toHaveCount(0);
  });
});
