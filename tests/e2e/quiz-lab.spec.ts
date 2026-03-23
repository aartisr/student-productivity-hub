import { expect, test } from "@playwright/test";

test.describe("Quiz Lab", () => {
  test("creates and runs a simple quiz attempt", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Auth", exact: true }).click();
    const authPanel = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Identity & Access" }) });
    await authPanel.getByPlaceholder("you@example.com").fill("demo@studenthub.app");
    await authPanel.getByPlaceholder("password", { exact: true }).fill("demo123");
    await authPanel.getByRole("button", { name: "Login" }).click();

    await page.getByRole("button", { name: "Quiz Lab" }).click();
    await expect(page.getByRole("heading", { name: "Quiz Lab: Generic, Extensible Engine" })).toBeVisible();

    await page.getByPlaceholder("What is the powerhouse of the cell?").fill("The sky is blue.");
    await page.getByTitle("Quiz question type").selectOption("boolean");
    await page.getByPlaceholder("B", { exact: true }).fill("True");
    await page.getByRole("button", { name: "Add question to draft" }).click();
    await page.getByRole("button", { name: "Save bank" }).click();

    await expect(page.getByText("Saved quiz bank:")).toBeVisible();
    await page.getByRole("button", { name: "Start" }).first().click();

    await page.getByRole("radio", { name: "True" }).check();
    await page.getByRole("button", { name: "Submit quiz" }).click();

    await expect(page.getByText("Latest score: 1/1 (100%)")).toBeVisible();
  });
});
