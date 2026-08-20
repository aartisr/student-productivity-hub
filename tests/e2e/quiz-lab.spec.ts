import { expect, test } from "@playwright/test";

test.describe("Quiz Lab", () => {
  test("creates and runs a simple quiz attempt", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { name: "Demo Student", email: "demo@studenthub.app", role: "student", id: "student-1" },
          expires: "2099-01-01T00:00:00.000Z",
        }),
      });
    });
    await page.goto("/");

    await expect(page.getByText("demo@studenthub.app")).toBeVisible();
    await page.getByRole("button", { name: "Quiz Lab", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Quiz Lab: Generic, Extensible Engine" })).toBeVisible();
    await page.getByRole("button", { name: "Create a quiz", exact: true }).click();

    const questionPrompt = page.getByPlaceholder("What is the powerhouse of the cell?");
    const correctAnswer = page.getByPlaceholder("B", { exact: true });
    await questionPrompt.fill("The sky is blue.");
    await page.getByTitle("Quiz question type").selectOption("boolean");
    await correctAnswer.fill("True");
    await expect(questionPrompt).toHaveValue("The sky is blue.");
    await expect(correctAnswer).toHaveValue("True");
    await page.getByRole("button", { name: "Add question to draft" }).click();
    await expect(page.getByText("Question added to draft.")).toBeVisible();
    await expect(page.getByText("Draft question count: 1")).toBeVisible();
    await page.getByRole("button", { name: "Save bank" }).click();

    await expect(page.getByText("Saved quiz bank: General Mastery Quiz.")).toBeVisible();
    await page.getByRole("button", { name: "Take a quiz", exact: true }).click();
    await page.getByRole("button", { name: "Start" }).first().click();

    await page.getByRole("radio", { name: "True" }).check();
    await page.getByRole("button", { name: "Submit quiz" }).click();

    await expect(page.getByText("Latest score: 1/1 (100%)")).toBeVisible();
  });
});
