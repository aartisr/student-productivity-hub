import { expect, test, type Page } from "@playwright/test";

const STORAGE_KEY = "student-productivity-hub-v1";

async function loginAsDemoUser(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Auth", exact: true }).click();
  const authPanel = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Identity & Access" }) });
  await authPanel.getByPlaceholder("you@example.com").fill("demo@studenthub.app");
  await authPanel.getByPlaceholder("password").first().fill("demo123");
  await authPanel.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByText("demo@studenthub.app")).toBeVisible();
}

test.describe("Lesson Studio and Share Exchange", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.removeItem(key);
    }, STORAGE_KEY);
  });

  test("creates, updates, and deletes a lesson", async ({ page }) => {
    await loginAsDemoUser(page);
    await page.getByRole("button", { name: "Quiz Lab" }).click();

    const lessonPanel = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Lesson Studio" }) });
    const lessonTitle = `Playwright Lesson ${Date.now()}`;

    await lessonPanel.getByPlaceholder("Cell Biology Fundamentals").fill(lessonTitle);
    await lessonPanel.getByRole("textbox", { name: "Biology", exact: true }).fill("Science");
    await lessonPanel
      .getByPlaceholder("Explain concepts, worked examples, and reflection prompts...")
      .fill("Draft content for retrieval practice and spaced review.");
    await lessonPanel.getByPlaceholder("revision, chapter-3, exam").fill("playwright, test");

    await lessonPanel.getByRole("button", { name: "Save lesson", exact: true }).click();
    await expect(page.getByText(`Lesson saved: ${lessonTitle}.`)).toBeVisible();

    const lessonRow = lessonPanel.locator("li").filter({ has: page.getByText(lessonTitle) }).first();
    await lessonRow.getByRole("button", { name: "Edit", exact: true }).click();

    const updatedTitle = `${lessonTitle} Updated`;
    await lessonPanel.getByPlaceholder("Cell Biology Fundamentals").fill(updatedTitle);
    await lessonPanel.getByRole("button", { name: "Update lesson", exact: true }).click();
    await expect(page.getByText(`Lesson updated: ${updatedTitle}.`)).toBeVisible();

    const updatedRow = lessonPanel.locator("li").filter({ has: page.getByText(updatedTitle) }).first();
    await updatedRow.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText("Lesson removed.")).toBeVisible();
    await expect(lessonPanel.locator("li").filter({ has: page.getByText(updatedTitle) })).toHaveCount(0);
  });

  test("shares and re-imports a bundle with lessons and quiz banks", async ({ page }) => {
    await loginAsDemoUser(page);
    await page.getByRole("button", { name: "Quiz Lab" }).click();

    const builderPanel = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Question Bank Builder" }) });
    const lessonPanel = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Lesson Studio" }) });
    const sharePanel = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Share Exchange" }) });

    const quizTitle = `Shared Quiz ${Date.now()}`;
    const lessonTitle = `Shared Lesson ${Date.now()}`;

    await builderPanel.getByPlaceholder("Biology Midterm Readiness").fill(quizTitle);
    await builderPanel.getByPlaceholder("What is the powerhouse of the cell?").fill("What organelle produces ATP?");
    await builderPanel.getByPlaceholder("Adenosine triphosphate\nMitochondria\nNucleus").fill("Mitochondria\nNucleus");
    await builderPanel.getByRole("textbox", { name: "B", exact: true }).fill("Mitochondria");
    await builderPanel.getByRole("button", { name: "Add question to draft", exact: true }).click();
    await builderPanel.getByRole("button", { name: "Save bank", exact: true }).click();
    await expect(page.getByText(`Saved quiz bank: ${quizTitle}.`)).toBeVisible();

    await lessonPanel.getByPlaceholder("Cell Biology Fundamentals").fill(lessonTitle);
    await lessonPanel
      .getByPlaceholder("Explain concepts, worked examples, and reflection prompts...")
      .fill("Lesson body used for share-pack round trip test.");
    await lessonPanel.getByRole("button", { name: "Save lesson", exact: true }).click();
    await expect(page.getByText(`Lesson saved: ${lessonTitle}.`)).toBeVisible();

    await sharePanel.getByRole("button", { name: "Generate share pack", exact: true }).click();
    await expect(page.getByText("Prepared bundle share pack.")).toBeVisible();

    const payloadField = sharePanel.getByPlaceholder("Copy this payload and share it, or paste a received payload and import");
    const payload = await payloadField.inputValue();
    expect(payload).toContain(lessonTitle);
    expect(payload).toContain(quizTitle);

    await sharePanel.getByRole("button", { name: "Import share pack", exact: true }).click();
    await expect(page.getByText("Imported 1 lesson(s) and 1 quiz bank(s) from share pack.")).toBeVisible();

    await expect(lessonPanel.getByText(`${lessonTitle} (2)`)).toBeVisible();
    const banksPanel = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Quiz Banks" }) });
    await expect(banksPanel.getByText(`${quizTitle} (2)`)).toBeVisible();
  });
});
