import { existsSync, unlinkSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const workspacePath = process.cwd();
const lockPath = resolve(workspacePath, ".next/dev/lock");

if (!existsSync(lockPath)) {
  process.exit(0);
}

let processList = "";
try {
  processList = execSync("ps -ax -o pid=,command=", { encoding: "utf8" });
} catch {
  // If process listing fails, do not risk deleting a potentially valid lock.
  process.exit(0);
}

const nextDevProcessLines = processList
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((line) => line.includes("next dev"));

const hasWorkspaceNextDev = nextDevProcessLines.some((line) => line.includes(workspacePath));

if (hasWorkspaceNextDev) {
  console.log("Active Next.js dev process detected for this workspace; keeping lock file.");
  process.exit(0);
}

unlinkSync(lockPath);
console.log("Removed stale Next.js dev lock file.");
