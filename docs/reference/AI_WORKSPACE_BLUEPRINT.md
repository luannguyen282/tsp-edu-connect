# AI Workspace Blueprint

This document is a technology-agnostic specification for designing a repository that an AI coding agent can understand, execute, validate, pause, hand off, and resume safely. It describes the repository control plane around the product, not the product's business domain or implementation stack.

The intended operating principle is:

> Autopilot is autonomous execution of approved intent, not autonomous definition of product intent.

## 1. Purpose

Use this blueprint to add an AI workspace control plane to a new or existing repository. A conforming workspace should let a newly started AI agent answer, without oral history:

- What is authoritative?
- What must always be read?
- What is the active plan and next executable task?
- Which contracts must not be broken?
- Which implementation choices are autonomous?
- Which validation proves completion?
- What changed in the last session?
- When must work stop for a human decision?

This blueprint applies to monoliths, multiple services, web or native applications, libraries, CLIs, data systems, and multi-repository workspaces. Product source and AI-control artifacts remain separate even when stored in the same Git repository.

## 2. Design Principles

1. **One entrypoint.** A short root instruction file routes the AI to authoritative context; it does not duplicate all context.
2. **Authority is explicit.** Every important artifact states whether it is authoritative, generated, advisory, or historical.
3. **Machine state has one writer.** Task status lives in one machine-readable registry. Human-readable summaries are generated views.
4. **Read narrowly.** Load a small always-read set, then follow task-specific links. Do not scan the whole repository for every task.
5. **Contracts are protected.** Stable behavior, interfaces, schemas, state transitions, security boundaries, and compatibility promises are named and validated.
6. **Plans express approved intent.** Tasks execute plans; tasks do not silently redefine them.
7. **Evidence closes work.** A status change to done requires concrete validation evidence, not a claim that code was written.
8. **History is not authority.** Completed plans, old handoffs, and superseded decisions are archived outside the default reading path.
9. **Local decisions stay local.** Reversible implementation choices may be made autonomously and recorded without changing product contracts.
10. **Failure is typed.** Runtime unavailable, external input missing, source defect, and product ambiguity are different states with different next actions.
11. **Generated artifacts are labeled.** An AI must know which files may be regenerated and which files must never be hand-edited.
12. **Security and data integrity are never optimized away.** Minimal process must not mean weak trust-boundary validation, unsafe migrations, or hidden contract breaks.

## 3. Conceptual Workspace Architecture

An AI-ready workspace has two distinct planes.

### Product/Application Plane

This is the system being built:

```text
<source-roots>/
<tests>/
<runtime-config>/
<build-tools>/
<deployment-assets>/
<product-docs>/
```

It contains application code, runtime schemas, migrations, tests, build files, and operational assets. Its exact shape is technology-dependent.

### AI Workspace Control Plane

This is the operating system for AI-assisted delivery:

```text
entry instructions
  -> context and authority index
  -> rules and contracts
  -> approved plan
  -> task registry
  -> source changes
  -> validation and evidence
  -> progress, decisions, and handoff
```

The control plane says how to reason about and safely modify the product plane. It should not become a second implementation of the product documentation.

### Observed vs Recommended

The following patterns are generalized from the reference workspace without copying its domain or technology choices.

| Observed pattern | Generalized principle | Recommended blueprint |
|---|---|---|
| A root instruction file defines read order, prohibited actions, repository topology, and task-routing rules. | The AI needs a single, short entrypoint. | Keep `AGENTS.md` concise and link to scoped files instead of accumulating every accepted change in it. |
| Narrative owner documents coexist with exact machine-readable contracts. | Meaning and exact values need different owners. | Store rationale and semantics in Markdown; store enumerable or schema-like invariants in JSON, YAML, schemas, or generated interface definitions. |
| A machine-readable task registry drives selection, while Markdown state and plan views are generated. | Mutable execution state must have one authority. | Make the registry authoritative; generate current-state and readable plan views from it. |
| Static scripts catch architecture, wiring, permission, and business-invariant regressions before task selection. | Cheap deterministic gates should run before expensive work. | Define a preflight command that checks repository shape, contract consistency, generated artifacts, and fast source invariants. |
| Active artifacts and frozen history are separated, with manifests and checksums. | Historical provenance must not contaminate active context. | Put superseded material in `archive/`; keep an active-artifact manifest and optional hashes for high-integrity contracts. |
| Nested source repositories have local instruction files. | Global rules need scoped refinement close to the code. | Allow module or repository `AGENTS.md` files that may narrow implementation rules but cannot override higher authority. |
| Reversible technical decisions and owner-level decisions are recorded separately. | Not every decision has the same authority. | Maintain a local implementation decision log plus formal ADRs for durable architectural or product-impacting decisions. |
| Phase handoffs capture accepted outcomes, changed areas, validation, and preserved invariants. | A handoff is a resume contract, not a progress essay. | Use a standard handoff record and archive it after its facts are absorbed into active authorities. |
| Large plans and long run logs can grow indefinitely. | Operational state must remain compact. | Keep current state short, archive completed plan detail, rotate logs, and link evidence instead of copying it. |

## 4. Recommended Directory Structure

Use one `.ai/` control-plane directory unless an existing repository convention strongly favors another name.

```text
/
|-- AGENTS.md
|-- .ai/
|   |-- README.md
|   |-- manifest.json
|   |-- context/
|   |   |-- project.md
|   |   |-- terminology.md
|   |   |-- architecture-index.md
|   |   `-- repository-map.md
|   |-- rules/
|   |   |-- general.md
|   |   |-- architecture.md
|   |   |-- coding.md
|   |   |-- testing.md
|   |   `-- security.md
|   |-- contracts/
|   |   |-- README.md
|   |   |-- catalog.json
|   |   `-- <contract-files>
|   |-- plans/
|   |   |-- ACTIVE.md
|   |   |-- active/
|   |   `-- archive/
|   |-- tasks/
|   |   |-- registry.json
|   |   `-- schemas/
|   |       `-- task.schema.json
|   |-- progress/
|   |   |-- current.md
|   |   |-- run-log.md
|   |   `-- handoff.md
|   |-- decisions/
|   |   |-- local.md
|   |   `-- adr/
|   |-- validation/
|   |   |-- commands.md
|   |   |-- evidence/
|   |   `-- generated/
|   |-- templates/
|   |   |-- plan.md
|   |   |-- task.json
|   |   |-- adr.md
|   |   |-- contract.md
|   |   `-- handoff.md
|   `-- archive/
|       `-- README.md
|-- <product-source>/
|-- <tests>/
|-- <project-configuration>/
`-- <project-documentation>/
```

Important variations:

- A small repository may keep plans, tasks, and progress in a few files rather than directories.
- A multi-repository workspace may keep shared product authority and task state in a coordination repository, while each source repository has its own scoped `AGENTS.md` and validation commands.
- Generated API/schema clients belong with the consuming source repository, but their upstream contract authority must be linked from `.ai/contracts/catalog.json`.
- Do not create empty directories merely to match the diagram. Add an artifact when it has a real owner and consumer.

## 5. Artifact Responsibilities

| Artifact | Responsibility | Authority | Update model |
|---|---|---|---|
| `AGENTS.md` | Entry point, mandatory read order, hard prohibitions, topology, escalation summary | Repository-wide operational authority | Human-owned; AI may propose focused edits |
| `.ai/README.md` | Control-plane map and artifact classification | Navigation authority | Human or AI, reviewed |
| `.ai/manifest.json` | Active artifact inventory, versions, generated flags, optional checksums | Machine-readable inventory | Script or controlled edit |
| `context/project.md` | Purpose, boundaries, actors, non-goals | Product context authority | Human-approved |
| `context/terminology.md` | Canonical vocabulary and aliases | Terminology authority | Human-approved |
| `context/architecture-index.md` | Boundary map and links to detailed architecture | Routing authority | Architect-owned, AI may update links |
| `rules/*.md` | Required and prohibited working behavior | Normative process authority | Human-owned by default |
| `contracts/*` | Stable interfaces, invariants, states, schemas, compatibility rules | Exact implementation authority for declared scope | Owner-approved; generated contracts use their generator |
| `plans/ACTIVE.md` | Pointer to approved active plan(s), not the plan body | Active-plan authority | Human approval or controlled command |
| `plans/active/*` | Goal, scope, sequence, gates, acceptance, stop conditions | Approved intent | Human-approved; AI executes |
| `tasks/registry.json` | Task definitions, dependency graph, state, evidence | Execution-state authority | AI through a task tool or schema-aware edit |
| `progress/current.md` | Compact generated resume view | Generated view, not status authority | Generated from registry and recent decisions |
| `progress/run-log.md` | Append-only execution journal | Operational history | AI appends concise entries |
| `progress/handoff.md` | Current-session transfer record | Resume aid | AI replaces at handoff |
| `decisions/local.md` | Reversible, scoped implementation choices | Local technical authority only | AI may append |
| `decisions/adr/*` | Durable architecture/product-impacting decisions | Approved decision authority | Human/architect approval |
| `validation/commands.md` | Named validation profiles and placeholders resolved for this project | Validation command authority | Maintainer-owned |
| `validation/evidence/*` | Durable evidence when command output alone is insufficient | Evidence only | Tool or AI generated |
| `archive/*` | Superseded plans, old handoffs, historical prompts, provenance | Historical only | Append/move; never default-load |

Each authoritative Markdown file should begin with compact metadata:

```yaml
---
status: draft | accepted | superseded | generated
owner: <role-or-team>
authority_for: <precise-scope>
version: <document-version>
last_reviewed: <date>
supersedes: <optional-reference>
---
```

## 6. AI Boot Sequence

The first-session sequence is ordered to prevent coding from stale or irrelevant context.

1. Read the root `AGENTS.md`.
2. Read `.ai/README.md` and `.ai/manifest.json`.
3. Read the project context summary and terminology.
4. Read the architecture index, not every architecture document.
5. Read `plans/ACTIVE.md` and the referenced approved plan.
6. Read `tasks/registry.json` through the task-selection tool or a compact query.
7. Read `progress/current.md` and the current handoff, if present.
8. Select the next eligible task according to registry policy.
9. Load only the contracts, rules, decisions, module instructions, source, and tests linked to that task.
10. Inspect callers, dependents, and existing patterns before editing.
11. Run preflight if the workspace declares it mandatory.
12. Start implementation only after scope, authority, and validation are known.

### Load Classes

| Class | Examples | Load rule |
|---|---|---|
| `ALWAYS` | Root instructions, active-plan pointer, current progress, architecture index | Every new session |
| `TASK_ROUTED` | Relevant contracts, module rules, selected plan section, recent related ADRs | After task selection |
| `SOURCE_LOCAL` | Nearest nested instruction file, affected source, callers, tests | Before editing that area |
| `EVIDENCE_ONLY` | Old command logs, screenshots, generated reports | Only when verifying a claim |
| `HISTORICAL` | Superseded plans, completed handoffs, archived prompts | Never by default |

On later sessions, the AI may use the same sequence but should prefer compact generated views and task-specific links over rescanning the repository.

## 7. Context Loading Strategy

### Always-load Context

Keep this set small enough to read on every session:

- operational entry instructions;
- active canonical/version pointer;
- active plan pointer;
- current execution summary;
- architecture and contract indexes;
- global safety and repository topology constraints.

### Task-specific Context

A task should name or resolve:

- exact plan section;
- relevant rules and contracts;
- affected module or repository;
- likely source entrypoints;
- direct callers and dependents;
- relevant tests and validation profile;
- related open decisions or known blockers.

### Historical Context

Archive and exclude from default search/loading:

- completed plans;
- superseded specifications;
- old task snapshots;
- previous handoffs whose facts are already incorporated;
- obsolete prompts;
- raw run logs older than the configured retention window.

### Context Hygiene Rules

- Link to an authority; do not paste its content into multiple files.
- Keep summaries descriptive, never independently normative.
- Add `generated: true` or a prominent generated warning to derived files.
- Maintain an index mapping topics to owner documents and contracts.
- Split documents by authority and scope, not arbitrary file size alone.
- Prefer structured queries against registries and catalogs over loading entire files.
- Do not paste implementation source into control-plane documents; link to the owning path and summarize only the invariant or boundary.
- Keep active files short enough to serve their single responsibility; split or archive chronology when a file becomes a mixed-purpose history dump.
- Exclude secrets, dependency caches, build output, and large generated artifacts from AI discovery unless directly relevant.
- Use placeholders in examples and redact tokens, credentials, internal addresses, personal data, and production identifiers from prompts, logs, evidence, and handoffs.

## 8. Rules and Instruction Hierarchy

### Four Distinct Concepts

**RULE**

A required or prohibited behavior for the AI or contributors. It answers: "How must work be performed?"

Example: "Run the contract check after changing a public interface."

**CONTRACT**

A stable interface, invariant, boundary, state transition, schema, compatibility promise, or externally visible behavior. It answers: "What must remain true?"

Example: "A published event contains these required fields and is backward compatible within the major version."

**PLAN**

An approved sequence of scoped changes intended to achieve a goal. It answers: "What outcome are we pursuing, in what order, and within what limits?"

**TASK**

The smallest independently executable and verifiable unit within a plan. It answers: "What can be done and objectively checked now?"

A rule is not a contract, a contract is not a plan, and a plan item is not complete until its tasks meet their acceptance criteria.

### Precedence

When instructions conflict, use this order:

1. Platform and safety constraints that cannot be overridden.
2. The user's explicit current instruction.
3. Accepted repository-wide safety, security, legal, and data-integrity rules.
4. Accepted product intent and canonical contracts.
5. Accepted architecture decisions and cross-module contracts.
6. Scoped repository/module instructions nearest the affected code.
7. The active approved plan and its phase gates.
8. The selected task definition and acceptance criteria.
9. Existing implementation and tests as evidence of current behavior.
10. Local implementation decisions.
11. AI assumptions.

Rules at a narrower scope may add constraints but must not weaken a higher-level authority. Exact schemas and enumerations should override paraphrased summaries for exact values; owner documents should override generated summaries for meaning and rationale.

The AI must not silently resolve a material conflict. It must stop when the conflict could change product behavior, a public contract, security, data integrity, compatibility, or approved scope. For harmless wording or reversible local implementation details, choose the smallest consistent option and record it if surprising.

## 9. Contracts

Contracts deserve a catalog because they are the boundary between autonomous implementation and unauthorized redesign.

### Contract Classes

- API and command/query contracts;
- data schemas and migration compatibility;
- public library interfaces;
- events and message semantics;
- state machines and lifecycle transitions;
- authorization, tenancy, ownership, and segregation rules;
- module ownership and dependency direction;
- runtime integration assumptions;
- user-visible route or file-format compatibility;
- acceptance scenarios that demonstrate invariants.

### Contract Catalog Entry

```json
{
  "id": "CONTRACT-<stable-id>",
  "title": "<short title>",
  "authority": ".ai/contracts/<path>",
  "owner": "<role-or-team>",
  "status": "accepted",
  "version": "<version>",
  "appliesTo": ["<module-or-surface>"],
  "validators": ["<contract-check-id>"],
  "compatibility": "<policy>",
  "changeApproval": "<required-approver>"
}
```

### Contract Change Protocol

1. Identify the contract owner and consumers.
2. Determine whether the change is compatible, versioned, migratory, or breaking.
3. Update the owner contract, not a downstream copy.
4. Update generated artifacts through their generator.
5. Update acceptance scenarios and validators.
6. Add a migration/backward-compatibility note when applicable.
7. Record an ADR for durable architectural or behavioral change.
8. Obtain required human approval before implementation when intent changes.

Never change an accepted contract merely to make implementation easier.

## 10. Planning Model

Plans are human-approved intent packages. A plan may contain phases, but each phase must have an explicit gate and no phase should auto-advance when owner acceptance is required.

### Plan Contract

```markdown
---
id: PLAN-<stable-id>
status: draft | approved | active | paused | completed | superseded
owner: <human-role>
execution_mode: assisted | autopilot
created: <date>
updated: <date>
---

# Plan: <name>

## Goal
<Observable outcome.>

## Intent Authority
<Links to approved requirements or decisions.>

## Context
<Only context needed to understand this plan.>

## Scope

### In Scope
- ...

### Out of Scope
- ...

## Constraints
- ...

## Contracts Affected
- <contract id and expected impact>

## Assumptions
- <assumption plus verification method>

## Phases and Gates
### Phase 1: <name>
- Entry conditions:
- Tasks:
- Exit criteria:
- Human acceptance required: yes | no

## Dependencies
- ...

## Validation Profile
- <profile id>

## Acceptance Criteria
- [ ] ...

## Rollback or Recovery
<How to return to a safe state.>

## Stop Conditions
- ...

## Completion and Archival
<How state and durable knowledge are folded back into authorities.>
```

### Planning Rules

- A plan must be approved before autopilot starts.
- Plans describe outcomes and boundaries; task records carry mutable execution state.
- Do not bury permanent contracts inside a temporary plan.
- Do not rewrite a plan during implementation to hide scope growth.
- If the plan changes materially, pause, revise, reapprove, and regenerate dependent tasks.

## 11. Task Model

A task must be independently selectable, implementable, and verifiable. If its acceptance cannot be demonstrated without unrelated work, split it or make the dependency explicit.

### Minimum Task Schema

```json
{
  "id": "TASK-<stable-id>",
  "planId": "PLAN-<stable-id>",
  "phase": "<phase-id>",
  "title": "<imperative title>",
  "objective": "<single outcome>",
  "deliverables": ["<observable output>"],
  "inScope": ["<bounded item>"],
  "outOfScope": ["<explicit exclusion>"],
  "inputs": ["<authority or dependency>"],
  "likelyAreas": ["<module or repository>"],
  "contracts": ["CONTRACT-<id>"],
  "dependencies": ["TASK-<id>"],
  "validationProfile": "<profile-id>",
  "acceptanceCriteria": ["<binary or observable criterion>"],
  "stopConditions": ["<task-specific escalation condition>"],
  "status": "TODO",
  "owner": "<role-or-agent>",
  "evidence": [],
  "lastUpdatedAt": null
}
```

### Recommended Status Model

| Status | Meaning | Autopilot action |
|---|---|---|
| `TODO` | Eligible when dependencies pass | May select |
| `IN_PROGRESS` | Currently owned by an agent/session | Resume or avoid duplicate work |
| `PARTIAL` | Some deliverables complete, concrete gap remains | May resume |
| `DONE` | Acceptance and required validation pass | Do not reopen without cause |
| `RUNTIME_DEFERRED` | Source complete; runtime proof unavailable | Continue independent source work |
| `BLOCKED_EXTERNAL` | Provider, legal, policy, credential, or owner input missing | Skip and select independent work |
| `BLOCKED_TECH` | A source/tooling defect prevents safe progress | Repair if in scope; otherwise escalate |
| `HOLD_GATE` | Phase gate awaits named evidence or acceptance | Do not advance past gate |
| `DEFERRED` | Intentionally outside current phase | Do not auto-start |
| `CANCELLED` | No longer part of approved intent | Preserve history |

Statuses must be defined once. The task tool should enforce allowed transitions, dependency checks, timestamps, and evidence requirements.

## 12. Progress & Resume Model

Use a machine registry for truth and compact generated documents for humans and AI sessions.

### Current Progress View

`.ai/progress/current.md` should contain only:

- active canonical/version;
- active plan and phase;
- in-progress tasks;
- next eligible tasks;
- current blockers by type;
- latest accepted decision links;
- last validation result;
- repositories or modules changed recently;
- generation timestamp and source registry reference.

It must say clearly: "Generated view; do not hand-edit task status."

### Run Log

Append one compact record per task batch:

```markdown
## <timestamp> - <task ids>

- Changed: <areas, not a file dump>
- Validation: <commands/check ids and result>
- Status: <new states>
- Remaining: <specific gap or none>
```

Rotate or archive the log when it becomes expensive to load. Current progress should never require reading the full run log.

### AI Handoff Contract

The current handoff must answer:

```markdown
# AI Handoff

- Generated/updated: <timestamp>
- Active plan/phase: <references>
- Task in progress: <id or none>
- Objective: <one sentence>
- Completed this session: <facts>
- Uncommitted changes: <repositories and paths>
- Validation run: <result and evidence references>
- Known failures: <exact symptoms>
- Decisions made: <links>
- Contracts to preserve: <links>
- Next safe action: <one concrete action>
- Stop condition currently active: <none or explanation>
```

AI B should be able to resume after reading the entry instructions, active plan, current progress, relevant contracts/decisions, this handoff, and the working-tree diff. Handoffs do not supersede contracts or task state.

## 13. Autopilot Execution Loop

```text
PREFLIGHT
  -> LOAD ACTIVE AUTHORITY
  -> SELECT ELIGIBLE TASK
  -> CLAIM TASK
  -> INSPECT RELEVANT FLOW
  -> IMPLEMENT SMALLEST COMPLETE CHANGE
  -> VALIDATE
  -> REVIEW DIFF AND CONTRACT IMPACT
  -> RECORD EVIDENCE
  -> UPDATE TASK/PROGRESS/HANDOFF
  -> SELECT NEXT TASK OR STOP
```

### Detailed Loop

1. Run preflight and classify failures.
2. Query the task registry for a small coherent batch, normally one or two tasks.
3. Confirm dependencies, phase gate, scope, authority, and validation profile.
4. Mark tasks `IN_PROGRESS` before editing.
5. Inspect the real implementation path end to end: entrypoint, callers, shared helpers, boundaries, tests, and generated artifacts.
6. Reuse existing patterns and dependencies; make the smallest change that fully satisfies acceptance criteria.
7. Add or update the smallest meaningful test/check for non-trivial behavior.
8. Run the task validation profile, then required contract and repository gates.
9. Review the diff for unrelated changes, secrets, generated-file mistakes, and contract drift.
10. Store concise evidence and update the authoritative task registry.
11. Regenerate current-state views; append the run log; update the handoff.
12. Auto-continue only when the next task is eligible and no stop condition applies.

### AUTO-CONTINUE

The AI may continue when all are true:

- approved plan and current phase are unambiguous;
- task dependencies and phase gates are satisfied;
- work stays inside declared scope;
- no accepted contract must change;
- decisions are reversible implementation details;
- validation passes, or unavailable runtime is explicitly allowed to defer;
- no destructive or externally consequential action is required;
- an independent eligible task remains.

### REQUIRE-HUMAN-DECISION

The AI must stop or skip the affected task when any condition in Section 14 applies. It may continue another independent task only if doing so cannot prejudge the missing decision.

## 14. Stop / Escalation Conditions

Stop and request a human decision for:

- ambiguous or contradictory approved intent;
- a change to business behavior or user-visible meaning not covered by the plan;
- a public, data, event, or compatibility contract change;
- a major architecture rewrite or new operational dependency outside the plan;
- security model, trust boundary, permission, privacy, or data-retention changes;
- destructive or irreversible migration without explicit approval and recovery plan;
- production deployment, destructive infrastructure action, or deletion of material data;
- credentials, secrets, legal terms, provider selection, or policy input that the AI cannot supply;
- acceptance criteria that cannot be made objective;
- repeated validation failure whose safe fix would exceed scope;
- evidence that the active plan is stale or superseded;
- a dirty working tree conflict that cannot be separated from user-owned changes.

Do not stop merely because:

- runtime infrastructure is temporarily unavailable and policy permits source completion;
- a non-critical external task can be deferred while independent tasks remain;
- a reversible implementation choice is not specified;
- the codebase has a deterministic, in-scope wiring or static regression that can be safely repaired;
- optional polish or deep hardening is deferred by the active plan.

Escalation output must include the conflicting authorities, observed evidence, why assumptions are unsafe, affected task IDs, and the smallest decision needed.

## 15. Validation Model

Validation is layered and risk-based. Define project-specific commands in `.ai/validation/commands.md`; plans and tasks reference validation profile IDs rather than copying commands.

### Command Registry

```markdown
# Validation Commands

## PROFILE: docs-only
- format: <docs-format-command>
- links: <link-check-command>
- policy: <control-plane-validator>

## PROFILE: source-fast
- format: <format-command>
- lint: <lint-command>
- typecheck-or-compile: <typecheck-or-compile-command>
- focused-test: <focused-test-command>
- contract-check: <contract-check-command>

## PROFILE: schema-change
- schema-validate: <schema-validation-command>
- migration-check: <migration-check-command>
- compatibility-check: <compatibility-command>
- source-fast: PROFILE source-fast

## PROFILE: release-gate
- build: <build-command>
- unit: <unit-test-command>
- integration: <integration-test-command>
- smoke: <smoke-command>
- security: <security-check-command>
- contract: <contract-check-command>
```

### Required Validation Loop

```text
modify
  -> format
  -> lint/static checks
  -> compile/build/typecheck
  -> focused unit checks
  -> relevant integration or smoke checks
  -> schema/migration checks when changed
  -> contract and architecture checks
  -> inspect diff and working-tree status
  -> record evidence
  -> update progress
```

Not every task needs every layer. The selected validation profile defines the minimum, while risk can add checks. Skipped checks must have a reason such as `not applicable`, `tool unavailable`, or `runtime deferred`; they must not be silently omitted.

### Evidence Contract

Evidence should record:

- validation profile;
- command or check identifier;
- timestamp;
- pass/fail/deferred result;
- relevant artifact or concise output summary;
- environment limitation, if any;
- source revision or diff reference when available.

## 16. Decision Records

Use two levels of decision record.

### Local Implementation Decision

For reversible choices that do not alter accepted behavior or architecture:

```markdown
## <date> - <short title>

- Context: <why a choice was needed>
- Decision: <what was chosen>
- Scope: <where it applies>
- Rationale: <why this is the smallest consistent choice>
- Revisit when: <measurable trigger>
```

The AI may append these autonomously. Local decisions must not redefine contracts, product meaning, security policy, or phase gates.

### Architecture Decision Record

For durable, cross-cutting, expensive-to-reverse, or externally visible choices:

```markdown
---
id: ADR-<number>
status: proposed | accepted | superseded | rejected
owner: <approver>
date: <date>
---

# <Decision title>

## Context
## Decision
## Alternatives Considered
## Consequences
## Compatibility and Migration
## Validation
## Reconsider When
## Supersedes / Superseded By
```

ADRs require the approval declared by repository policy. When an ADR changes a contract, both artifacts and their validation must be updated together.

## 17. Human vs AI Ownership

| Artifact/action | Human responsibility | AI responsibility |
|---|---|---|
| Product intent and non-goals | Define and approve | Clarify conflicts; do not invent |
| Global rules | Own and approve | Follow; propose focused improvements |
| Contracts | Own meaning and breaking changes | Preserve, implement, validate, flag drift |
| Architecture decisions | Approve durable decisions | Analyze, propose, record consequences |
| Plans and phase gates | Approve scope and sequencing | Execute and report evidence |
| Task decomposition | Review when material | Generate/refine within approved plan |
| Task status | Audit/review | Update through controlled tooling |
| Reversible technical choices | Set boundaries | Decide and record when non-obvious |
| Source and tests | Review as needed | Modify within task scope |
| Validation | Define required profiles | Run, interpret, and record evidence |
| Runtime-unavailable state | Set policy | Defer honestly and continue if allowed |
| Production actions | Authorize and own | Prepare steps; execute only when explicitly authorized |
| Secrets and credentials | Provision securely | Never invent, expose, or commit |
| Archive and provenance | Define retention | Move superseded artifacts and preserve references |

## 18. Lifecycle of a Feature

```text
Need identified
  -> intent clarified
  -> affected contracts located
  -> decision/ADR created if needed
  -> plan approved
  -> tasks generated with dependencies and validation
  -> task selected and claimed
  -> relevant context loaded
  -> implementation and focused checks
  -> contract/build/smoke validation
  -> evidence recorded
  -> task and generated progress updated
  -> phase gate accepted
  -> durable knowledge folded into context/contracts
  -> plan and handoff archived
```

At each transition:

- Intent changes require human authority.
- Contract changes require owner approval and compatibility handling.
- Implementation details may be autonomous within approved boundaries.
- Completion requires evidence.
- Archived artifacts must not remain active instructions.

## 19. Example New Project Workspace

The following example is intentionally domain- and technology-neutral.

```text
example-project/
|-- AGENTS.md
|-- .ai/
|   |-- README.md
|   |-- manifest.json
|   |-- context/
|   |   |-- project.md
|   |   |-- terminology.md
|   |   |-- architecture-index.md
|   |   `-- repository-map.md
|   |-- rules/
|   |   |-- general.md
|   |   |-- coding.md
|   |   |-- testing.md
|   |   `-- security.md
|   |-- contracts/
|   |   |-- README.md
|   |   `-- catalog.json
|   |-- plans/
|   |   |-- ACTIVE.md
|   |   |-- active/PLAN-001.md
|   |   `-- archive/
|   |-- tasks/
|   |   |-- registry.json
|   |   `-- schemas/task.schema.json
|   |-- progress/
|   |   |-- current.md
|   |   |-- handoff.md
|   |   `-- run-log.md
|   |-- decisions/
|   |   |-- local.md
|   |   `-- adr/
|   |-- validation/
|   |   `-- commands.md
|   |-- templates/
|   `-- archive/
|-- src/
|-- tests/
|-- docs/
|-- scripts/
`-- <project build/runtime files>
```

For multiple independent source repositories, add a coordination map:

```text
workspace/
|-- AGENTS.md
|-- .ai/
|-- source-a/     # independent repository, local scoped instructions
|-- source-b/     # independent repository, local scoped instructions
`-- source-c/     # independent repository, local scoped instructions
```

The repository map must state Git boundaries, which repository owns each contract or generated artifact, and where validation must run. Never assume a parent repository tracks child repository changes.

## 20. Bootstrap Procedure

An AI receiving this blueprint plus an existing or new project should perform the following sequence. During bootstrap, it must not rewrite product behavior merely to make documentation consistent.

### Step 1 - Inventory the Repository

- Input: repository tree, Git boundaries, build files, existing instructions.
- Action: identify source roots, tests, schemas, docs, generated files, deployment assets, nested repositories, and ignored paths.
- Output: draft repository map.
- Validation: every top-level area has a stated purpose and owner or is marked unknown.

### Step 2 - Discover Existing Authority

- Input: README files, instruction files, specifications, schemas, decisions, plans, tickets, tests, and runtime contracts.
- Action: classify each artifact as authoritative, generated, advisory, or historical.
- Output: authority inventory and conflict list.
- Validation: no two active artifacts claim the same exact authority without a precedence rule.

### Step 3 - Identify Architecture Boundaries

- Input: source layout, dependency manifests, entrypoints, imports, deployment units, data boundaries.
- Action: map modules/services/apps, dependency direction, public interfaces, and repository ownership.
- Output: `context/architecture-index.md` and `context/repository-map.md`.
- Validation: a task can be routed to its owning module and repository without scanning everything.

### Step 4 - Extract Rules and Conventions

- Input: existing source patterns, formatter/linter configuration, test conventions, security practices.
- Action: document only stable, repeatedly observed, or explicitly approved conventions.
- Output: minimal `rules/` files.
- Validation: rules do not merely restate tool configuration and do not conflict with current accepted code without noting migration intent.

### Step 5 - Catalog Contracts

- Input: public interfaces, schemas, state transitions, authorization rules, compatibility guarantees, acceptance tests.
- Action: identify owners and create a contract catalog linking to existing sources of truth.
- Output: `contracts/catalog.json` plus missing contract drafts where necessary.
- Validation: critical externally visible or data-integrity behavior has an authority and validator.

### Step 6 - Define Validation Profiles

- Input: existing build, format, lint, test, schema, migration, smoke, and security commands.
- Action: group commands into named risk-based profiles using placeholders only until the real project commands are confirmed.
- Output: `validation/commands.md`.
- Validation: each active task type can name a runnable minimum profile.

### Step 7 - Create the Entrypoint and Context Router

- Input: authority inventory, repository map, rules, contracts, validation profiles.
- Action: create a short `AGENTS.md`, `.ai/README.md`, and `.ai/manifest.json`.
- Output: deterministic boot sequence and scoped read paths.
- Validation: a fresh AI can state the read order and distinguish active from historical artifacts.

### Step 8 - Normalize the Active Plan

- Input: human-approved goal, scope, constraints, dependencies, gates, and acceptance criteria.
- Action: convert it to the plan contract without adding product intent.
- Output: approved plan and `plans/ACTIVE.md` pointer.
- Validation: every phase has entry/exit criteria and stop conditions.

### Step 9 - Build the Task Registry

- Input: approved plan.
- Action: create small tasks with dependencies, contracts, validation profiles, and objective acceptance criteria.
- Output: schema-valid `tasks/registry.json`.
- Validation: next-task selection is deterministic and blocked tasks are typed.

### Step 10 - Create Resume State

- Input: registry, current source state, recent decisions, working-tree status.
- Action: generate current progress, initialize run log, and write current handoff.
- Output: `progress/current.md`, `progress/run-log.md`, `progress/handoff.md`.
- Validation: a second AI can identify the next safe action without conversation history.

### Step 11 - Add Deterministic Control-plane Validation

- Input: manifest, schemas, references, generated views, contracts, task registry.
- Action: add a small validator for missing files, broken links, invalid task transitions, stale generated views, duplicate authority, and forbidden active references to archive.
- Output: `<control-plane-validator>`.
- Validation: intentionally breaking one invariant causes the validator to fail clearly.

### Step 12 - Dry-run the Boot and Autopilot Loop

- Input: completed control plane and one low-risk task.
- Action: start a fresh AI session, select the task, inspect, validate without unnecessary edits, and produce a handoff.
- Output: readiness evidence and identified gaps.
- Validation: the AI follows authority, does not load history by default, and neither invents intent nor loses task state.

## 21. Minimal Required Files

For a small project, start here and add nothing else until needed:

```text
AGENTS.md
.ai/README.md
.ai/context/project.md
.ai/context/architecture-index.md
.ai/rules/general.md
.ai/contracts/README.md
.ai/plans/ACTIVE.md
.ai/plans/active/<plan>.md
.ai/tasks/registry.json
.ai/progress/current.md
.ai/validation/commands.md
```

Minimum requirements:

- one entrypoint;
- one active-context summary;
- one architecture router;
- one contract index;
- one approved plan pointer;
- one authoritative task/progress state;
- one validation command registry;
- explicit stop conditions.

A single small project may combine terminology with project context, local decisions with current progress, and handoff with current progress. Do not combine authoritative contracts with mutable task state.

## 22. Recommended Files

Add these when more than one person/agent or module is involved:

- `.ai/manifest.json` for inventory and generated flags;
- `.ai/context/terminology.md` for vocabulary consistency;
- `.ai/context/repository-map.md` for multi-root ownership;
- separate architecture, coding, testing, and security rules;
- machine-readable contract catalog;
- task JSON schema and task-control command;
- generated current-state view;
- append-only run log;
- current handoff;
- local implementation decision log;
- ADR directory;
- plan/task/contract/handoff templates;
- archive index and retention policy;
- control-plane validator.

## 23. Optional Advanced Files

Large or regulated projects may add:

- module-level or repository-level nested `AGENTS.md` files;
- multiple active plans with explicit concurrency/ownership rules;
- dependency graph and critical-path generator;
- generated repository or symbol map;
- contract compatibility reports;
- acceptance-to-task-to-evidence traceability mapping;
- artifact manifests with hashes or signatures;
- change-risk classification;
- data-classification and threat-model indexes;
- migration rehearsal records;
- release readiness gates;
- automated stale-document detection;
- evidence retention and audit export;
- CI integration that runs existing validation profiles;
- agent lease/claim records for concurrent agents;
- machine-readable handoff and session metadata.

Advanced features must solve an observed coordination, compliance, or scale problem. Do not build a workflow engine for a project that needs a checklist.

## 24. Anti-patterns

| Anti-pattern | Risk | Recommendation |
|---|---|---|
| One enormous instruction file | High token cost and contradictory local rules | Keep a short entrypoint and route by topic/scope |
| The same rule copied into many files | Drift and unclear authority | Store once; link elsewhere |
| Plans mixed with permanent product documentation | Temporary sequencing becomes accidental contract | Separate approved intent from durable context/contracts |
| Markdown status and JSON status both editable | Conflicting progress truth | Use one registry and generated views |
| Task without acceptance or validation | Completion becomes subjective | Require observable criteria and a validation profile |
| AI must reread the repository on every task | Slow, expensive, higher hallucination risk | Maintain indexes and task-routed context |
| Old prompts and handoffs remain active | Superseded instructions influence implementation | Archive and exclude them from default search |
| Generated files are hand-edited | Changes are overwritten or diverge | Label generator and regeneration command |
| Business rules exist only in source code | Refactors can silently change meaning | Promote critical invariants into owned contracts |
| Every technical choice requires human input | Autopilot stalls on reversible details | Define autonomous decision boundaries |
| AI changes a plan to match its implementation | Scope and accountability disappear | Pause and reapprove material plan changes |
| Runtime unavailability is reported as source failure | Independent work stops unnecessarily | Use a distinct deferred-runtime status |
| External dependency absence blocks all tasks | Throughput collapses | Block only affected tasks and continue independent ones |
| Handoff is a long narrative | Next agent cannot find current state | Use a compact handoff contract |
| Run log is loaded as context | History overwhelms current truth | Generate short current state and archive old log segments |
| Secrets copied into docs, logs, or examples | Credential exposure | Use placeholders, secret stores, and redaction checks |
| Existing code is treated as higher authority than accepted contracts | Legacy behavior becomes permanent by accident | Use implementation as evidence, not product intent |
| Tool-specific commands are scattered through plans | Tool changes require mass edits | Centralize commands in validation profiles |
| Unscoped refactoring during feature work | Larger risk and unverifiable completion | Change the smallest end-to-end path required by the task |

## 25. AI Readiness Checklist

### Entrypoint and Authority

- [ ] The repository has one obvious AI entrypoint.
- [ ] The entrypoint defines mandatory read order and hard prohibitions.
- [ ] Active, generated, advisory, and historical artifacts are distinguishable.
- [ ] Authority and conflict precedence are documented.
- [ ] The active product/canonical version is explicit.
- [ ] Historical files are outside the default reading path.

### Context and Architecture

- [ ] Project purpose, boundaries, non-goals, and terminology exist.
- [ ] Architecture boundaries and dependency direction are indexed.
- [ ] Multi-repository or module ownership is explicit.
- [ ] Nested instructions exist only where scoped rules differ.
- [ ] An AI can route a task without scanning the whole repository.

### Rules and Contracts

- [ ] Rules, contracts, plans, and tasks are clearly distinguished.
- [ ] Critical public, data, security, state, and compatibility contracts have owners.
- [ ] Exact machine-readable contracts are preferred for exact values.
- [ ] Contract change and compatibility procedures are defined.
- [ ] Accepted contracts have relevant validators or acceptance scenarios.

### Plans and Tasks

- [ ] An approved active plan is easy to locate.
- [ ] The plan states in-scope, out-of-scope, dependencies, gates, acceptance, and stop conditions.
- [ ] Tasks are small, independently executable, and dependency-aware.
- [ ] Each task references affected contracts and a validation profile.
- [ ] Task statuses and allowed transitions are defined.
- [ ] The next eligible task can be selected deterministically.
- [ ] Machine-readable task state has one authority.

### Progress, Resume, and Handoff

- [ ] Current progress is compact and generated from authoritative state.
- [ ] In-progress work, next tasks, blockers, and recent decisions are visible.
- [ ] The latest validation state is visible.
- [ ] A current AI handoff follows a stable contract.
- [ ] A fresh AI can resume without chat history.
- [ ] Run logs and completed handoffs are archived or rotated.

### Validation and Safety

- [ ] Project-specific validation commands are centralized.
- [ ] Risk-based validation profiles exist.
- [ ] A deterministic preflight checks repository and control-plane health.
- [ ] Generated files and their generators are identified.
- [ ] Schema/migration, contract, security, and architecture checks exist where relevant.
- [ ] Evidence is required before `DONE`.
- [ ] Runtime-unavailable and external-blocked states are distinct.
- [ ] Production, destructive, security-sensitive, and breaking actions require explicit authority.
- [ ] Secrets and internal identifiers are excluded from documentation and logs.

### Autopilot Acceptance Test

- [ ] The AI can load the correct context in order.
- [ ] The AI can select and claim an eligible task.
- [ ] The AI can identify the contracts it must preserve.
- [ ] The AI can implement within approved scope without inventing product intent.
- [ ] The AI can run the correct validation profile.
- [ ] The AI can record evidence and update task state safely.
- [ ] The AI can distinguish `AUTO-CONTINUE` from `REQUIRE-HUMAN-DECISION`.
- [ ] The AI can continue an independent task when one task is externally blocked.
- [ ] The AI can stop with a precise escalation when authority is missing.
- [ ] The AI can hand off and resume in a new session.

A repository is ready for safe autopilot only when the final acceptance-test group passes. Missing optional advanced artifacts do not block readiness if the minimal control plane is complete and the project's actual risk is covered.
