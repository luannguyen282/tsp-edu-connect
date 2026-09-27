import { existsSync } from "node:fs";
import { spawn } from "node:child_process";

if (existsSync(".env") && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(".env");
}

const args = ["-r", "--parallel", "--filter", "@tspec/api", "--filter", "@tspec/web", "dev"];
const isWindows = process.platform === "win32";
// pnpm is a .cmd shim on Windows and must run through cmd.exe.
const child = spawn(isWindows ? (process.env.ComSpec ?? "cmd.exe") : "pnpm", isWindows ? ["/d", "/s", "/c", `pnpm ${args.join(" ")}`] : args, { stdio: "inherit", env: process.env });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
