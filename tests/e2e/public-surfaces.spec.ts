import { expect, test } from "@playwright/test";

test.describe("Public project surfaces", () => {
  test("serves the project story and its attribution", async ({ request }) => {
    const response = await request.get("/story.html");

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("text/html");

    const body = await response.text();
    expect(body).toContain("Project Story & Thanks");
    expect(body).toContain("A classroom beginning, kept open.");
    expect(body).toContain("Aarti S Ravikumar");
    expect(body).toContain("PCSS II");
    expect(body).toContain("Mr. Shaol");
  });

  test("serves the about and resources pages", async ({ request }) => {
    for (const [path, content] of [
      ["/about.html", "About | Student Productivity Hub"],
      ["/resources.html", "Resources | Student Productivity Hub"],
    ]) {
      const response = await request.get(path);

      expect(response.ok(), `${path} should be available`).toBeTruthy();
      expect(response.headers()["content-type"]).toContain("text/html");
      await expect(response.text()).resolves.toContain(content);
    }
  });

  test("keeps public discovery resources available", async ({ request }) => {
    for (const path of ["/manifest.webmanifest", "/sitemap.xml", "/robots.txt", "/llms.txt"]) {
      const response = await request.get(path);
      expect(response.ok(), `${path} should be available`).toBeTruthy();
    }
  });
});
