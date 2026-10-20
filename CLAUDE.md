# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Freshly scaffolded template: dependencies have not been installed and nothing has been built or run yet. No test runner or ESLint is configured (`lint` scripts are just `tsc --noEmit`). Prisma has no migrations yet.

## Commands

pnpm workspaces monorepo (Node 22, `corepack enable` to get pnpm). Run from the repo root:

- `pnpm install`
- `pnpm db:up` / `pnpm db:down` — local Postgres 16 via `docker-compose.yml`
- `pnpm db:migrate` (`prisma migrate dev`), `pnpm db:generate`, `pnpm db:studio`
- `pnpm dev` — web and api in parallel; or `pnpm dev:web` / `pnpm dev:api`
- `pnpm build`, `pnpm lint` — recursive over all packages
- `pnpm --filter @expense/api <script>` to target a single package

Env setup: copy `.env.example` → `.env`, `apps/api/.env.example` → `apps/api/.env`, `apps/web/.env.example` → `apps/web/.env.local`. `DATABASE_URL` in `apps/api/.env` must match the credentials in the root `.env` used by docker-compose.

## Architecture

- `apps/web` (`@expense/web`) — Next.js 16 App Router on :3000. Talks to the API through `src/lib/api.ts` using `NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api`).
- `apps/api` (`@expense/api`) — NestJS 12 on :4000, global prefix `/api`, CORS limited to `WEB_ORIGIN`, global `ValidationPipe` (whitelist + transform). Feature modules (`expenses`, `categories`, `health`) sit beside a `@Global()` `PrismaModule` exposing `PrismaService`, so feature services inject it without importing the module.
- **Auth** — `users` (Prisma-backed `UsersRepository` + CQRS commands/queries), `categories` (same pattern: repository, create/update/delete commands, list query; writes are owner-scoped) and `auth` (`POST /api/auth/register|login`, bcrypt + JWT via `@nestjs/jwt`) modules use `@nestjs/cqrs`; `JwtAuthGuard` is opt-in per route (`@UseGuards`), `JWT_SECRET`/`JWT_EXPIRES_IN` come from `apps/api/.env`. `User.passwordHash` must never leave the API (use `toPublicUser`).
- `packages/shared` (`@expense/shared`) — TypeScript-only types shared by both apps, consumed as source (`main` points at `src/index.ts`, no build step). Next handles it via `transpilePackages`. API code must only `import type` from it, since Node can't run its `.ts` at runtime.
- Database schema lives in `apps/api/prisma/schema.prisma` (Postgres: `User`, `Category`, `Expense`). `Expense.amount` is `Decimal(12,2)`, which serializes to a string over JSON — hence `amount: string` in the shared types. `userId` relations are optional because auth isn't implemented yet.

## Gotchas

- **API is ESM** (Nest 12 is ESM-only): `"type": "module"`, `nodenext` resolution. Relative imports in `apps/api/src` must end in `.js` (e.g. `./app.module.js`).
- **Prisma is pinned to v6** (`prisma` and `@prisma/client` `^6`). Prisma 7 requires a different setup (`prisma.config.ts`, new generator, URL out of the schema) and was deliberately deferred; don't bump it casually.
- TypeScript is pinned to `^6.0.3` (not 7.x; `@nestjs/schematics` 12 needs >=6) and `@types/node` to `^22` to match the Node version.
