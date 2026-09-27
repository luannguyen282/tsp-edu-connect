import { readFileSync, writeFileSync } from "node:fs";

const registryPath = ".ai/tasks/registry.json";
const progressPath = ".ai/progress/current.md";
const allowed = new Set(["TODO", "IN_PROGRESS", "PARTIAL", "DONE", "RUNTIME_DEFERRED", "BLOCKED_EXTERNAL", "BLOCKED_TECH", "HOLD_GATE", "DEFERRED", "CANCELLED"]);

function load() { return JSON.parse(readFileSync(registryPath, "utf8")); }
function save(reg) { writeFileSync(registryPath, `${JSON.stringify(reg, null, 2)}\n`); writeProgress(reg); }
function map(reg) { return new Map(reg.tasks.map((t) => [t.id, t])); }
function depsDone(task, tasks) { return task.dependencies.every((id) => tasks.get(id)?.status === "DONE"); }
function waveRank(wave) { return Number(String(wave).replace(/\D/g, "")) || 999; }

function validate(reg) {
  const tasks = map(reg);
  const errors = [];
  if (tasks.size !== reg.tasks.length) errors.push("duplicate task id");
  for (const t of reg.tasks) {
    if (!allowed.has(t.status)) errors.push(`${t.id}: invalid status ${t.status}`);
    for (const dep of t.dependencies) if (!tasks.has(dep)) errors.push(`${t.id}: missing dependency ${dep}`);
  }
  const visiting = new Set(); const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) { errors.push(`dependency cycle at ${id}`); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of tasks.get(id)?.dependencies ?? []) visit(dep);
    visiting.delete(id); visited.add(id);
  }
  for (const id of tasks.keys()) visit(id);
  return errors;
}

function eligible(reg) {
  const tasks = map(reg);
  return reg.tasks
    .filter((t) => t.status === "TODO" && depsDone(t, tasks))
    .sort((a, b) => waveRank(a.wave) - waveRank(b.wave) || a.id.localeCompare(b.id));
}

function writeProgress(reg) {
  const next = eligible(reg);
  const active = reg.tasks.filter((t) => ["IN_PROGRESS", "PARTIAL"].includes(t.status));
  const blocked = reg.tasks.filter((t) => t.status.startsWith("BLOCKED") || t.status === "RUNTIME_DEFERRED" || t.status === "HOLD_GATE");
  const done = reg.tasks.filter((t) => t.status === "DONE").length;
  const text = `# Current Progress\n\n> Generated view; do not hand-edit task status. Source: \`${registryPath}\`.\n\n- Active plan: ${reg.planId}\n- Completed: ${done}/${reg.tasks.length}\n- In progress: ${active.length ? active.map((t) => `${t.id} ${t.title}`).join("; ") : "none"}\n- Next eligible: ${next.length ? next.slice(0, 5).map((t) => `${t.id} ${t.title}`).join("; ") : "none"}\n- Blocked/deferred: ${blocked.length ? blocked.map((t) => `${t.id}(${t.status})`).join(", ") : "none"}\n- Generated: ${new Date().toISOString()}\n`;
  writeFileSync(progressPath, text);
}

const reg = load();
const errors = validate(reg);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const [cmd, id, status, ...evidenceParts] = process.argv.slice(2);
if (!cmd || cmd === "next") {
  const next = eligible(reg)[0];
  console.log(next ? JSON.stringify(next, null, 2) : "No eligible TODO task.");
} else if (cmd === "check") {
  writeProgress(reg);
  console.log(`Task registry OK: ${reg.tasks.length} tasks, ${eligible(reg).length} currently eligible.`);
} else if (cmd === "summary") {
  writeProgress(reg);
  console.log(readFileSync(progressPath, "utf8"));
} else if (cmd === "set") {
  if (!id || !status || !allowed.has(status)) throw new Error("Usage: ai-task.mjs set <TASK_ID> <STATUS> [evidence]");
  const tasks = map(reg); const task = tasks.get(id);
  if (!task) throw new Error(`Unknown task: ${id}`);
  if (["IN_PROGRESS", "DONE"].includes(status) && !depsDone(task, tasks)) {
    const pending = task.dependencies.filter((dep) => tasks.get(dep)?.status !== "DONE");
    throw new Error(`${id} dependencies not DONE: ${pending.join(", ")}`);
  }
  const evidence = evidenceParts.join(" ").trim();
  if (status === "DONE" && !evidence) throw new Error("DONE requires evidence text.");
  task.status = status;
  task.lastUpdatedAt = new Date().toISOString();
  if (evidence) task.evidence.push({ at: task.lastUpdatedAt, note: evidence });
  save(reg);
  console.log(`${id} -> ${status}`);
} else {
  throw new Error("Commands: next | check | summary | set");
}
