# Local Development

## Requirements

- Git
- Node.js 22.12+ for runtime; Node 24.15+ LTS recommended for full Nest CLI/schematics
- PostgreSQL reachable from the developer machine
- Internet access for the first `pnpm install`

Docker is optional and is not required by the baseline.

## First setup

From the repository root:

```bash
node scripts/preflight.mjs
node scripts/bootstrap.mjs
```

`bootstrap` only installs `pnpm` when it is missing. It does not install PostgreSQL, Docker, Redis, Keycloak, S3/MinIO, SMS, or mail services.

Review `.env` and set `DATABASE_URL` to the PostgreSQL instance you already use.

Example only:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tspec?schema=public
```

Then:

```bash
pnpm db:check
pnpm db:push
pnpm dev
```

Open:

- Web: `http://localhost:3000`
- API health: `http://localhost:3001/health`

## PostgreSQL

TSPEC never auto-installs PostgreSQL. If a local/remote instance already exists, use it.

If the database `tspec` does not exist and your local PostgreSQL tools are available, create it using your normal database administration flow, for example:

```bash
createdb tspec
```

Do not copy this command blindly when your PostgreSQL host/user differs; configure `DATABASE_URL` instead.

`pnpm db:push` is the fast initial local schema sync. Once real business data and collaborative migrations begin, use:

```bash
pnpm db:migrate
```

and commit generated migrations.

## Normal development

```bash
pnpm dev
pnpm ai:next
```

Before handing work off:

```bash
pnpm typecheck
pnpm build
```

Run focused Playwright smoke tests only when the active task requires runtime UI proof:

```bash
pnpm smoke
```

No unit-test suite or coverage target is required in the current baseline.

## Ponytail

Bootstrap tries to configure Ponytail only when a supported coding-host CLI is detected. You can rerun it safely:

```bash
node scripts/setup-ponytail.mjs
node scripts/setup-ponytail.mjs --install
```

`AGENTS.md` remains the project-level YAGNI/vibe-code fallback when no host plugin is available.
