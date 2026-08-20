import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3011",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 3011",
    url: "http://127.0.0.1:3011",
    timeout: 180000,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: "mobile-iphone-13-mini",
      use: {
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: "mobile-pixel-7",
      use: {
        viewport: { width: 412, height: 915 },
      },
    },
    {
      name: "tablet-ipad",
      use: {
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "laptop-1366",
      use: {
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: "desktop-1920",
      use: {
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
