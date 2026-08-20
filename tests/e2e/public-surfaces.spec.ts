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

  test("keeps public discovery resources available", async ({ request }) => {
    for (const path of ["/manifest.webmanifest", "/sitemap.xml", "/robots.txt", "/llms.txt"]) {
      const response = await request.get(path);
      expect(response.ok(), `${path} should be available`).toBeTruthy();
    }
  });
});
