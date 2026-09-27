# Validation Commands

## PROFILE: preflight
- `node scripts/preflight.mjs`
- `node scripts/ai-task.mjs check`

## PROFILE: docs-only
- `node scripts/ai-task.mjs check`

## PROFILE: source-fast
- `pnpm typecheck`
- `pnpm build`

## PROFILE: schema-change
- `pnpm db:generate`
- `pnpm --filter @tspec/db exec prisma validate`
- `pnpm db:push` for local proof, then `pnpm db:migrate` when the task creates a durable migration
- `pnpm typecheck`

## PROFILE: runtime-smoke
- source-fast
- run the changed happy path manually or with one focused Playwright/API smoke

## PROFILE: security-smoke
- runtime-smoke
- add focused checks for the relevant tenant/IDOR/workspace/scope/relationship/conflict boundary

## PROFILE: release-smoke
- `pnpm db:generate`
- `pnpm typecheck`
- `pnpm build`
- `pnpm smoke`

No baseline unit-test profile exists by design.
