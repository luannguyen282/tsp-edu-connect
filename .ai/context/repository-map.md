# Repository Map

Canonical Git remote: `https://github.com/luannguyen282/tsp-edu-connect.git`

| Path | Owner / purpose |
|---|---|
| `apps/web` | Next.js role workspaces and UX |
| `apps/api` | NestJS HTTP API and business modules |
| `packages/db` | Prisma schema/client/migrations |
| `docs/product` | product authority and UI coverage map |
| `docs/architecture` | durable technical decisions |
| `docs/reference` | source references; do not silently rewrite |
| `.ai` | AI control plane, plan/task/progress |
| `scripts` | deterministic bootstrap/task/preflight helpers |
| `.data/uploads` | local dev file-store root; content ignored by Git |

Single-repository modular monolith. Do not create nested Git repositories or deployable microservices during the baseline.
