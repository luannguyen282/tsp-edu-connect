import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync } from "node:fs";

function execute(name, args, options) {
  const useWindowsShell = process.platform === "win32" && !/\.exe$/i.test(name);
  return execFileSync(useWindowsShell ? (process.env.ComSpec ?? "cmd.exe") : name, useWindowsShell ? ["/d", "/s", "/c", `${name} ${args.join(" ")}`] : args, options);
}

function has(name) {
  try {
    execute(name, ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function run(name, args, { optional = false } = {}) {
  console.log(`> ${name} ${args.join(" ")}`);
  try {
    execute(name, args, { stdio: "inherit" });
    return true;
  } catch (error) {
    if (optional) {
      console.warn(`Optional command failed: ${name} ${args.join(" ")}`);
      return false;
    }
    throw error;
  }
}

run(process.execPath, ["scripts/preflight.mjs"]);

if (!has("pnpm")) {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const version = pkg.packageManager.split("@")[1];
  if (has("corepack")) {
    run("corepack", ["enable"]);
    run("corepack", ["prepare", `pnpm@${version}`, "--activate"]);
  } else if (has("npm")) {
    console.log("pnpm is missing; installing the pinned workspace version with existing npm.");
    run("npm", ["install", "--global", `pnpm@${version}`]);
  } else {
    throw new Error("pnpm is missing and neither Corepack nor npm is available.");
  }
}

if (!existsSync(".env")) {
  copyFileSync(".env.example", ".env");
  console.log("Created .env from .env.example.");
}

run("pnpm", ["install"]);
run("pnpm", ["db:generate"]);
run(process.execPath, ["scripts/setup-ponytail.mjs", "--install"], { optional: true });

console.log("\nBootstrap complete.");
console.log("1) Review .env and point DATABASE_URL to an existing PostgreSQL instance.");
console.log("2) Run: pnpm db:check");
console.log("3) First local schema sync: pnpm db:push");
console.log("4) Run: pnpm dev");
