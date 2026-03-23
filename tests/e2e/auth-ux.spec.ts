import { expect, test } from "@playwright/test";

test.describe("Auth UX flow", () => {
  test("shows return context when auth is required", async ({ page }) => {
    await page.route("**/api/auth/providers", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          google: {
            id: "google",
            name: "Google",
            type: "oauth",
            signinUrl: "http://127.0.0.1:3001/api/auth/signin/google",
            callbackUrl: "http://127.0.0.1:3001/api/auth/callback/google",
          },
        }),
      });
    });

    await page.goto("/planner");

    await expect(page).toHaveURL(/auth=required/);
    await expect(page.getByRole("heading", { name: "Welcome to Student Productivity Hub" })).toBeVisible();
    await expect(page.getByText("Sign in required to continue to: /planner")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  });

  test("propagates returnTo into OAuth callbackUrl", async ({ page }) => {
    await page.route("**/api/auth/providers", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          google: {
            id: "google",
            name: "Google",
            type: "oauth",
            signinUrl: "http://127.0.0.1:3001/api/auth/signin/google",
            callbackUrl: "http://127.0.0.1:3001/api/auth/callback/google",
          },
        }),
      });
    });

    await page.route("**/api/auth/signin/google**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>stubbed oauth handoff</body></html>",
      });
    });

    await page.goto("/?auth=required&returnTo=%2Fplanner");

    const [signInRequest] = await Promise.all([
      page.waitForRequest((request) => request.url().includes("/api/auth/signin/google")),
      page.getByRole("button", { name: "Continue with Google" }).click(),
    ]);

    const signInUrl = new URL(signInRequest.url());
    const queryCallback = signInUrl.searchParams.get("callbackUrl") || "";
    const bodyParams = new URLSearchParams(signInRequest.postData() || "");
    const bodyCallback = bodyParams.get("callbackUrl") || "";
    const callbackUrl = decodeURIComponent(bodyCallback || queryCallback);
    expect(callbackUrl).toContain("/planner");
  });

  test("restores authenticated user in app shell", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            name: "Learner",
            email: "learner@example.com",
            role: "student",
            id: "student-1",
          },
          expires: "2099-01-01T00:00:00.000Z",
        }),
      });
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Student Productivity Hub" })).toBeVisible();
    await expect(page.getByText("learner@example.com")).toBeVisible();
  });
});
