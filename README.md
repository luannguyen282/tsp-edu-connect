# TSP Edu Connect (TSPEC)

Development workspace for **TSP EduConnect / TSPEC**, a center-first multi-tenant education-center operations platform.

GitHub repository: `https://github.com/luannguyen282/tsp-edu-connect`

This baseline is intentionally a **modular monolith**:

- `apps/web` — Next.js 16 + React 19 + TypeScript
- `apps/api` — NestJS 12 + TypeScript
- `packages/db` — PostgreSQL + Prisma 7
- `pnpm` workspace — no Turborepo until it provides real value
- local file storage — no S3/MinIO yet
- local authentication/account provisioning — no Keycloak yet
- no Redis/BullMQ, SMS, email provider, microservices, or Kubernetes in the initial baseline
- focused smoke validation only; no unit-test suite/coverage target

The durable product behavior is owned by `docs/product/TSPEC_BUSINESS_RULES_MASTER_V6.md`. The HTML prototype in `docs/reference/tspec-prototype-v7.html` is the UI/screen reference and must not override business rules.

## Start here

Recommended: Node.js 24 LTS. Runtime minimum: Node.js 22.12. Nest generators/schematics need 22.22.3+, 24.15+, or 26+.

```bash
node scripts/preflight.mjs
node scripts/bootstrap.mjs
```

Bootstrap:

1. checks the local environment;
2. reuses existing tools;
3. installs the pinned `pnpm` only when missing;
4. creates `.env` from `.env.example` only when missing;
5. installs workspace dependencies;
6. generates the Prisma client;
7. attempts Ponytail setup only for a supported coding host.

It deliberately **does not install PostgreSQL or Docker**.

Configure the existing PostgreSQL you want to use in `.env`, then:

```bash
pnpm db:check
pnpm db:push
pnpm dev
```

Open:

- Web: `http://localhost:3000`
- API health: `http://localhost:3001/health`

See `docs/LOCAL_DEVELOPMENT.md` for the detailed local flow.

## Git

The distributed workspace ZIP is initialized as the project Git repository with:

```text
origin = https://github.com/luannguyen282/tsp-edu-connect.git
branch = main
```

Verify after unzip:

```bash
git remote -v
git status
```

When you are ready and GitHub authentication is configured locally:

```bash
git push -u origin main
```

No production deployment action is part of the baseline.

## AI / vibe-code workflow

Every AI coding session starts with `AGENTS.md`.

Useful commands:

```bash
pnpm ai:check
pnpm ai:next
node scripts/ai-task.mjs set TS-001 IN_PROGRESS
node scripts/ai-task.mjs set TS-001 DONE "<evidence>"
```

Task dependency state in `.ai/tasks/registry.json` is authoritative. An agent must not start a task whose dependencies are incomplete.

The active implementation plan is split into waves from developer bootstrap through identity/context, catalogs, classes/enrollment, scheduling, attendance/makeup, tuition/workload/ratings, and final UI/smoke completion.

## Current status

This ZIP is a **runnable development baseline**, not the finished TSPEC application. It contains the repository structure, minimal Web/API boot, initial Prisma identity/tenant/media/audit model, product documents, complete implementation plan/task graph, local setup scripts, and UI coverage map. Business modules are implemented wave-by-wave from the task registry.
