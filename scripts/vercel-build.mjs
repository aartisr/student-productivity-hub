import { spawnSync } from "node:child_process";

const canonicalUrl = "https://sph.ai-aarti.com";
const authUrlKeys = ["NEXTAUTH_URL", "AUTH_URL", "NEXTAUTH_URL_INTERNAL", "AUTH_URL_INTERNAL"];

for (const key of authUrlKeys) {
  if (!process.env[key]?.trim()) process.env[key] = canonicalUrl;
}

const result = spawnSync("npm", ["run", "build"], {
  env: process.env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
