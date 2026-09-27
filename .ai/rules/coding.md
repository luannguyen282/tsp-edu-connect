# Coding Rules

- TypeScript strict mode.
- No `any` unless interfacing with an untyped external boundary and the reason is local and explicit.
- Keep tenant scoping visible in repositories/services; do not hide it in magical global filters.
- Business mutations use a database transaction when multiple invariant-bearing records change together.
- Prefer plain functions/services and framework primitives over internal frameworks.
- Do not introduce repository/service layers just to wrap Prisma one-to-one; add an abstraction only at a real boundary (auth provider, storage provider, external delivery, clock, etc.).
- API DTOs are not Prisma models.
