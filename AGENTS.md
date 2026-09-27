# TSPEC Agent Entry Point

Read in this order before editing:

1. `.ai/context/project.md`
2. `.ai/context/architecture-index.md`
3. `.ai/plans/ACTIVE.md` and its referenced plan
4. `.ai/tasks/registry.json` via `node scripts/ai-task.mjs next`
5. `.ai/progress/current.md`
6. Task-routed rules/contracts/source only

Hard rules:

- `docs/product/TSPEC_BUSINESS_RULES_MASTER_V6.md` owns product behavior.
- `docs/reference/tspec-prototype.html` owns screen coverage and visual intent where it does not conflict with business rules.
- Never bypass `tenantId`, active workspace, scope, relationship, or permission checks.
- Never log plaintext passwords, password hashes, tokens, or secrets.
- No public self-signup unless product intent is explicitly changed. Baseline accounts are admin-provisioned.
- Do not add Redis, queues, S3/MinIO, Keycloak, SMS, email, microservices, Kubernetes, CQRS/event sourcing, or another framework unless an active task requires it.
- No unit tests in the baseline. Use type/build checks plus focused smoke E2E only where the task requires runtime proof.
- Do not rewrite the prototype wholesale. Reuse its information architecture/design tokens and implement the smallest complete vertical slice.

Ponytail mode for this repository:

1. Skip what is not required.
2. Prefer platform/framework features already present.
3. Prefer an installed dependency before adding another.
4. Make the smallest complete change that satisfies the task and preserves security/data integrity.
5. Leave a short `ponytail:` comment only when intentionally deferring a clearly named upgrade path.

Task control:

- `node scripts/ai-task.mjs check`
- `node scripts/ai-task.mjs next`
- `node scripts/ai-task.mjs set <TASK_ID> IN_PROGRESS`
- implement + validate
- `node scripts/ai-task.mjs set <TASK_ID> DONE "<evidence>"`

Do not hand-edit `.ai/progress/current.md`; it is generated from the registry.
