import { execSync } from "node:child_process";

const workspacePath = process.cwd();

let processList = "";
try {
  processList = execSync("ps -ax -o pid=,command=", { encoding: "utf8" });
} catch {
  process.exit(0);
}

const targetPids = processList
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((line) => line.includes(workspacePath))
  .filter((line) => line.includes("next dev") || line.includes("next-server (v"))
  .map((line) => line.split(/\s+/, 1)[0])
  .filter((pid) => /^\d+$/.test(pid));

if (targetPids.length === 0) {
  console.log("No running Next.js dev process found for this workspace.");
  process.exit(0);
}

for (const pid of targetPids) {
  try {
    process.kill(Number(pid), "SIGTERM");
  } catch {
    // Ignore missing/terminated process races.
  }
}

console.log(`Stopped ${targetPids.length} Next.js dev process(es).`);
