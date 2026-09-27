# Local Implementation Decisions

## 2026-09-27 — pnpm workspace without Turborepo

- Decision: use native pnpm recursive/filter commands only.
- Rationale: one web app + one API + one DB package does not need another orchestration layer yet.
- Revisit when: build graph/caching or more packages create measurable pain.

## 2026-09-27 — defer Redis/BullMQ

- Decision: no queue infrastructure in bootstrap.
- Rationale: authoritative schedule generation is synchronous; no current workflow requires durable delayed retries.
- Revisit when: external delivery, retries, or long-running jobs become an approved requirement.

## 2026-09-27 — local media behind provider-neutral asset data

- Decision: local filesystem now, `MediaAsset.storageProvider/storageKey` in data.
- Revisit when: deployment needs shared/object storage.

## 2026-09-27 — local identity with external identity seam

- Decision: local password auth now; account stores optional external issuer/subject for later Keycloak mapping.
- Revisit when: SSO/federation/centralized IAM is approved.

## 2026-09-27 — no unit-test suite in baseline

- Decision: type/build/schema checks + focused smoke flows.
- Revisit when: regression rate or business-logic complexity shows a concrete need.
