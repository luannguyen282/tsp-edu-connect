# Testing Rules — Baseline

The project explicitly does not build a deep or unit-test-heavy suite in the initial phase.

Minimum validation by task:

- static/source changes: typecheck + build where runnable;
- schema changes: Prisma validate/generate/migrate against dev DB;
- user-visible business flow: one focused Playwright smoke path when the wave reaches runtime integration;
- authorization/tenant boundaries: include focused API/runtime checks for the critical leakage cases named by Business Rules.

Do not create unit tests merely to increase coverage.
