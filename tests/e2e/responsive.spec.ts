import { expect, test } from "@playwright/test";

test.describe("Responsive shell", () => {
  test("recovers from malformed persisted top-level data", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("student-productivity-hub-v1", JSON.stringify({
        currentUser: 42,
        assignments: "not-a-record",
        planner: null,
        socialProof: [],
      }));
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Student Productivity Hub" })).toBeVisible();
    await expect(page.getByText(/Join 2,847 students already studying smarter/)).toBeVisible();
  });

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

  test("uses a compact app header and discloses workspace metrics on demand", async ({ page }) => {
    await page.goto("/");

    const header = page.locator(".app-header");
    await expect(header).toBeVisible();
    expect((await header.boundingBox())?.height).toBeLessThan(90);
    await expect(page.getByText("active assignments", { exact: false })).toBeHidden();

    await page.getByText("Overview", { exact: true }).click();
    await expect(page.getByText("active assignments", { exact: false })).toBeVisible();
    await expect(page.getByRole("group", { name: "Device preview mode" })).toBeVisible();
    const overviewIsOnTop = await page.locator(".workspace-overview-menu").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const topElement = document.elementFromPoint(rect.left + 8, rect.top + 8);
      return Boolean(topElement && element.contains(topElement));
    });
    expect(overviewIsOnTop).toBeTruthy();
  });

  test("protected tabs redirect guests to auth", async ({ page }) => {
    await page.goto("/timer");
    await expect(page.getByRole("heading", { name: "Welcome to Student Productivity Hub" })).toBeVisible();
    await expect(page.getByText("Sign in required to continue to: /timer")).toBeVisible();

    await page.goto("/analytics");
    await expect(page.getByRole("heading", { name: "Welcome to Student Productivity Hub" })).toBeVisible();

    await page.goto("/backup");
    await expect(page.getByRole("heading", { name: "Welcome to Student Productivity Hub" })).toBeVisible();
  });

  test("uses a progressive More menu for secondary student tools", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { name: "Learner", email: "learner@example.com", role: "student", id: "student-1" },
          expires: "2099-01-01T00:00:00.000Z",
        }),
      });
    });
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Home", exact: true })).toBeVisible();
    await page.getByText("More", { exact: true }).click();
    await expect(page.getByRole("button", { name: "Study Coach", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Study Coach", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Study Coach (Learning Science Mode)" })).toBeVisible();
  });

  test("keeps every authenticated module within the responsive shell", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { name: "Learner", email: "learner@example.com", role: "student", id: "student-1" },
          expires: "2099-01-01T00:00:00.000Z",
        }),
      });
    });
    await page.goto("/");
    await expect(page.getByText("learner@example.com")).toBeVisible();

    for (const label of ["Assignments", "Planner", "Pomodoro", "Quiz Lab"]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(overflow).toBeFalsy();
    }

    for (const label of ["Study Coach", "Analytics", "GPA", "Motivation", "Export/Backup", "Auth"]) {
      const moreMenu = page.locator("details.app-navigation-more");
      if (!(await moreMenu.evaluate((element) => element instanceof HTMLDetailsElement && element.open))) {
        await page.getByText("More", { exact: true }).click();
      }
      await page.getByRole("button", { name: label, exact: true }).click();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(overflow).toBeFalsy();
    }
  });

  test("groups home content by the selected student intent", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Today Command Center" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Workload Risk Radar" })).toHaveCount(0);

    await page.getByRole("button", { name: /Progress/ }).click();
    await expect(page.getByRole("heading", { name: "Workload Risk Radar" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Today Command Center" })).toHaveCount(0);

    await page.getByRole("button", { name: /Community/ }).click();
    await expect(page.getByRole("heading", { name: /Global Leaderboard/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Workload Risk Radar" })).toHaveCount(0);
  });

  test("supports keyboard selection of related Home workspace views", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /Today/ }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("heading", { name: "Workload Risk Radar" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Progress/ })).toBeFocused();
  });

  test("separates data transfer, backups, and preferences into focused views", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { name: "Learner", email: "learner@example.com", role: "student", id: "student-1" },
          expires: "2099-01-01T00:00:00.000Z",
        }),
      });
    });
    await page.goto("/");
    await page.getByText("More", { exact: true }).click();
    await page.getByRole("button", { name: "Export/Backup", exact: true }).click();

    await expect(page.getByLabel("Export payload")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Settings" })).toHaveCount(0);
    await page.getByRole("button", { name: "Preferences", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByLabel("Export payload")).toHaveCount(0);
  });

  test("guides an authenticated student through empty workspaces", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { name: "Learner", email: "learner@example.com", role: "student", id: "student-1" },
          expires: "2099-01-01T00:00:00.000Z",
        }),
      });
    });
    await page.goto("/");

    await page.getByRole("button", { name: "Assignments", exact: true }).click();
    await expect(page.getByText("Your assignment list is clear. Add the next deadline you want to protect.")).toBeVisible();

    await page.getByRole("button", { name: "Planner", exact: true }).click();
    await expect(page.getByText("Capture one small next step to turn today into momentum.")).toBeVisible();
  });
});
