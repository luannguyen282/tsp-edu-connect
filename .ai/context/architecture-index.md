---
status: accepted
owner: engineering
authority_for: architecture-routing
version: 1
last_reviewed: 2026-09-27
---

# Architecture Index

- Stack and deferrals: `docs/architecture/TECH_STACK.md`
- Data/integration seams: `docs/architecture/DATA_AND_INTEGRATIONS.md`
- Repository ownership: `.ai/context/repository-map.md`
- Product UI coverage: `docs/product/UI_SURFACE_MAP.md`
- Product behavior: `docs/product/TSPEC_BUSINESS_RULES_MASTER_V6.md`

Runtime shape:

`Next.js web -> NestJS modular monolith -> Prisma -> PostgreSQL`

Local files are stored outside business tables and referenced by `MediaAsset`.

Dependency direction:

- web consumes API contracts, never Prisma models;
- API owns application/business orchestration;
- DB package owns schema/client only;
- business modules remain inside one API deployable during baseline.
