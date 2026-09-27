import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

function command(name, args = ["--version"]) {
  try {
    // Windows package-manager shims are .cmd files and need cmd.exe to run.
    const isWindows = process.platform === "win32";
    return execFileSync(isWindows ? (process.env.ComSpec ?? "cmd.exe") : name, isWindows ? ["/d", "/s", "/c", `${name} ${args.join(" ")}`] : args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch {
    return null;
  }
}

function versionTuple(text) {
  const match = text?.match(/v?(\d+)\.(\d+)\.(\d+)/);
  return match ? match.slice(1).map(Number) : null;
}

function gte(a, b) {
  if (!a) return false;
  for (let i = 0; i < 3; i += 1) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return true;
}

const node = process.version;
const nodeVersion = versionTuple(node);
const nodeOk = nodeVersion && ((nodeVersion[0] === 22 && gte(nodeVersion, [22, 12, 0])) || nodeVersion[0] === 24 || nodeVersion[0] === 26);
const schematicsOk = nodeVersion && ((nodeVersion[0] === 22 && gte(nodeVersion, [22, 22, 3])) || (nodeVersion[0] === 24 && gte(nodeVersion, [24, 15, 0])) || nodeVersion[0] === 26);
const git = command("git");
const pnpm = command("pnpm");
const corepack = command("corepack");
const npm = command("npm");
const psql = command("psql");
const docker = command("docker");
const codex = command("codex");
const ponytail = command("codex", ["plugin", "list"])?.match(/^ponytail@ponytail\s+installed, enabled\s+(\S+)/m)?.[1] ?? null;
const rows = [
  ["Node runtime", node, nodeOk ? "OK" : "BLOCK: use Node 22.12+, 24.x, or 26.x"],
  ["Nest schematics", node, schematicsOk ? "OK" : "WARN: nest generate/upgrade need Node 22.22.3+, 24.15+, or 26+"],
  ["Git", git, git ? "OK" : "BLOCK"],
  ["pnpm", pnpm, pnpm ? "OK" : "MISSING: bootstrap installs only if needed"],
  ["Corepack", corepack, corepack ? "FOUND" : "not found"],
  ["npm", npm, npm ? "FOUND" : "not found"],
  ["psql", psql, psql ? "FOUND" : "not found; PostgreSQL may still be remote"],
  ["Docker", docker, docker ? "FOUND (optional)" : "not installed; not required"],
  ["Codex", codex, codex ? "FOUND" : "not found"],
  ["Ponytail", ponytail, ponytail ? "INSTALLED, ENABLED" : "not installed; optional coding-host plugin"],
  ["Claude", command("claude"), command("claude") ? "FOUND" : "not found"],
  ["Copilot", command("copilot"), command("copilot") ? "FOUND" : "not found"],
  ["Gemini", command("gemini"), command("gemini") ? "FOUND" : "not found"],
  ["OpenCode", command("opencode"), command("opencode") ? "FOUND" : "not found"]
];

console.table(rows.map(([component, version, status]) => ({ component, version: version ?? "-", status })));

const requiredFiles = [
  "AGENTS.md",
  ".ai/tasks/registry.json",
  "docs/product/TSPEC_BUSINESS_RULES_MASTER_V6.md",
  "docs/reference/tspec-prototype.html",
  "apps/web/package.json",
  "apps/api/package.json",
  "packages/db/prisma/schema.prisma"
];
for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`Missing required workspace file: ${file}`);
    process.exitCode = 1;
  }
}

if (!nodeOk || !git) process.exitCode = 1;
