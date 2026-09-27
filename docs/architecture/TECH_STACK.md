# Baseline Tech Stack

- Node.js 24 LTS target for full NestJS 12 CLI support.
- pnpm 10 workspace.
- Next.js 16.3.x / React 19.
- NestJS 12 modular monolith.
- PostgreSQL.
- Prisma ORM 7 pinned to major 7 while Prisma 8 is still pre-GA during workspace creation.
- TypeScript 5.9.
- Tailwind CSS + shadcn/ui introduced with the first real UI slice, not bootstrap-only markup.
- TanStack Query for server-state, React Hook Form + Zod for forms/validation when those flows are implemented.
- Playwright for focused smoke E2E only.

Deferred: Turborepo, Redis/BullMQ, Keycloak, S3/MinIO, SMS/email, Kubernetes, microservices.
