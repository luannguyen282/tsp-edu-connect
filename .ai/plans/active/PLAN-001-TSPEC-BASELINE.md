---
id: PLAN-001-TSPEC-BASELINE
status: active
owner: product-owner
execution_mode: autopilot
created: 2026-09-27
updated: 2026-09-27
---

# Plan: TSPEC Basic Business Baseline

## Goal

Deliver the current Business Rules and designed workspace screens as a working local-development modular monolith, with basic happy-path smoke validation and no unnecessary infrastructure.

## Intent authority

- `docs/product/TSPEC_BUSINESS_RULES_MASTER_V6.md`
- `docs/reference/tspec-prototype.html`
- current user constraints captured in `.ai/context/project.md`

## Scope

In scope: local dev environment, local auth/provisioning, tenant/workspace/RBAC, centers/facilities, people, subjects/images, classes, enrollment/withdrawal, scheduling/sessions/holidays/progress, attendance/makeup, tuition, teacher workload, ratings, role workspaces, system admin surfaces, audit, prototype screen coverage.

Out of scope: public signup, invitation activation, payroll, Keycloak, S3/MinIO, SMS/email providers, Redis/BullMQ, microservices, production deployment, advanced finance/refund/discount/tax policy, deep test suite.

## Waves and gates

### Wave 0 — Developer bootstrap
Environment preflight, package manager/dependencies, PostgreSQL configuration, Ponytail agent setup, health boot.

Gate: web + API health + Prisma migration can run on a developer machine.

### Wave 1 — Identity, context and shell
Local login, first-login confirmation, tenant/workspace selection, admin account provisioning, effective permissions, role-specific navigation.

Gate: one provisioned account can login, complete first login, select context and reach the correct workspace without cross-workspace menu union.

### Wave 2 — Organization and catalogs
Centers/facilities, people/relationships, subjects with local image storage, configurable roles/permissions and audit visibility.

Gate: Tenant Admin can create the prerequisite catalog data needed for a class.

### Wave 3 — Classes and enrollment
Class CRUD/lifecycle, teacher assignments, parent catalog, enrollment application, child classes and pre-start withdrawal.

Gate: Parent request → admin approval → pending enrollment → class activation path works.

### Wave 4 — Scheduling and progress
Holidays/timeslots, timetable conflict rules, synchronous TeachingSession generation/reconciliation, ad-hoc sessions, progress and role schedule views.

Gate: activating/configuring a class deterministically creates conflict-safe future sessions and progress can be derived.

### Wave 5 — Attendance and makeup
Teacher attendance, student self check-in approval, class makeup, individual makeup.

Gate: one session can complete attendance and one absence can follow a supported makeup path.

### Wave 6 — Money, workload and ratings
Tuition/payment baseline, teacher workload, class/teacher rating behavior.

Gate: the three read models derive from real business records rather than prototype constants.

### Wave 7 — Surface completion and smoke release
System-admin surfaces, dashboards, prototype coverage gap closure, focused end-to-end smoke, build/docs/handoff.

Gate: every UI surface in `UI_SURFACE_MAP.md` is implemented or explicitly marked out-of-scope by product authority; basic flows pass.

## Validation profile

Use `.ai/validation/commands.md`. No unit-test requirement in this plan.

## Stop conditions

Stop only for product ambiguity that changes behavior/contracts, destructive migration without recovery, new security model, external credentials/provider choice, or an infrastructure dependency outside the approved baseline.
