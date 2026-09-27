import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const install = process.argv.includes("--install");

function has(name) {
  try {
    execFileSync(name, ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function runSafe(name, args) {
  console.log(`> ${name} ${args.join(" ")}`);
  try {
    execFileSync(name, args, { stdio: "inherit" });
    return true;
  } catch {
    console.warn("Command did not complete. It may already be installed, require interactive approval, or the host version may differ.");
    return false;
  }
}

function showOrRun(name, args) {
  if (install) return runSafe(name, args);
  console.log(`  ${name} ${args.join(" ")}`);
  return true;
}

console.log("Ponytail is an AI coding-host plugin/skill, not a TSPEC runtime dependency.");

if (has("codex")) {
  showOrRun("codex", ["plugin", "marketplace", "add", "DietrichGebert/ponytail"]);
  showOrRun("codex", ["plugin", "add", "ponytail@ponytail"]);
  console.log("Codex: open /hooks, review/trust Ponytail hooks, then start a new thread.");
} else if (has("copilot")) {
  showOrRun("copilot", ["plugin", "marketplace", "add", "DietrichGebert/ponytail"]);
  showOrRun("copilot", ["plugin", "install", "ponytail@ponytail"]);
} else if (has("gemini")) {
  showOrRun("gemini", ["extensions", "install", "https://github.com/DietrichGebert/ponytail"]);
} else if (has("agy")) {
  showOrRun("agy", ["plugin", "install", "https://github.com/DietrichGebert/ponytail"]);
} else if (has("opencode")) {
  const file = "opencode.json";
  const desired = { plugin: ["@dietrichgebert/ponytail"] };
  if (!existsSync(file)) {
    if (install) writeFileSync(file, `${JSON.stringify(desired, null, 2)}\n`);
    else console.log(`  create ${file} with ${JSON.stringify(desired)}`);
  } else {
    try {
      const current = JSON.parse(readFileSync(file, "utf8"));
      const plugins = new Set(Array.isArray(current.plugin) ? current.plugin : []);
      plugins.add("@dietrichgebert/ponytail");
      current.plugin = [...plugins];
      if (install) writeFileSync(file, `${JSON.stringify(current, null, 2)}\n`);
      else console.log(`  ensure ${file} contains @dietrichgebert/ponytail`);
    } catch {
      console.warn("opencode.json exists but is not valid JSON; left unchanged.");
    }
  }
  console.log("OpenCode Ponytail project configuration is ready.");
} else if (has("claude")) {
  console.log("Claude Code detected. Ponytail installation requires two interactive slash commands:");
  console.log("  /plugin marketplace add DietrichGebert/ponytail");
  console.log("  /plugin install ponytail@ponytail");
} else {
  console.log("No supported coding-host CLI detected. No global plugin was installed.");
  console.log("AGENTS.md contains the project-level Ponytail/YAGNI fallback rules, so AI work can still proceed.");
}
