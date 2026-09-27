# Bootstrap Environment Report (artifact-build environment)

Observed while creating this workspace:

- Debian 13
- Node.js v22.16.0
- npm 10.9.2
- Corepack 0.32.0
- Git 2.47.3
- pnpm: not installed
- PostgreSQL CLI/server: not available
- Docker: not available
- Codex CLI: not available
- Ponytail: not installed

Attempting to enable pnpm through Corepack failed because the artifact-build runtime could not fetch from the npm registry. This is an environment/network limitation, not a project dependency decision.

The repository bootstrap script retries pnpm setup on the actual development machine and does not attempt to install PostgreSQL/Docker automatically.
