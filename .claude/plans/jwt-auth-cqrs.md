# Plan: JWT auth + users module with CQRS (apps/api)

## Context
The API has no authentication yet (`userId` relations in Prisma are optional "because auth isn't implemented"). We add a `users` module (persistence of users) and a separate `auth` module (JWT login + registration), both using `@nestjs/cqrs`.

Interpretation: "hash and password fields" → a single stored `passwordHash` column (plain passwords are never stored); the plain `password` exists only in request DTOs.

## Dependencies (apps/api/package.json)
- `@nestjs/cqrs`, `@nestjs/jwt` (versions compatible with Nest 12 — check with `pnpm view` before adding)
- `bcryptjs` (pure JS, no native build, works in ESM) + `@types/bcryptjs` if needed
- No passport: a small custom `JwtAuthGuard` built on `JwtService` keeps ESM/deps simple.

## Prisma (apps/api/prisma/schema.prisma)
Extend `User`: `passwordHash String`, `isActive Boolean @default(true)`, `lastLoginAt DateTime?` (keep `email @unique`, `name`, timestamps). Make `name` required-optional as is. Then `pnpm db:migrate --name add_user_auth` (first migration; DB must be up via `pnpm db:up`). Note: `passwordHash` required is fine since the table is empty.

## Users module — `src/users/`
- `users.module.ts` — imports `CqrsModule`, exports `UsersRepository` and the query/command handlers' buses via CqrsModule.
- `users.repository.ts` — thin wrapper over `PrismaService` (`findByEmail`, `findById`, `create`, `touchLastLogin`); emails normalised to lowercase.
- `commands/create-user.command.ts` + handler (creates user; throws `ConflictException` on duplicate email, catching Prisma `P2002`).
- `commands/record-login.command.ts` + handler (updates `lastLoginAt`).
- `queries/get-user-by-email.query.ts` + handler (returns user incl. hash, internal use), `queries/get-user-by-id.query.ts` + handler (returns public user).
- `users.types.ts` — `PublicUser` (no `passwordHash`) + mapper.
- `users.controller.ts` — `GET /api/users/me` (guarded) via `GetUserByIdQuery`.

## Auth module — `src/auth/`
- `auth.module.ts` — imports `CqrsModule`, `UsersModule`, `JwtModule.registerAsync` (secret `JWT_SECRET`, expiry `JWT_EXPIRES_IN` from `ConfigService`).
- `dto/register.dto.ts` (`email` IsEmail, `name` IsString, `password` MinLength 8 / MaxLength 72), `dto/login.dto.ts`.
- `commands/register.command.ts` + handler: hash with bcrypt (cost 12) → `CreateUserCommand` → issue token.
- `commands/login.command.ts` + handler: `GetUserByEmailQuery` → bcrypt compare → generic `UnauthorizedException('Invalid credentials')` for both unknown email and wrong password → `RecordLoginCommand` → issue token.
- `token.service.ts` — signs `{ sub: userId, email }`.
- `auth.controller.ts` — `POST /api/auth/register`, `POST /api/auth/login`, each dispatching to `CommandBus`; response `{ accessToken, user: PublicUser }`.
- `jwt-auth.guard.ts` (verifies Bearer token, sets `request.user = { id, email }`) and `current-user.decorator.ts`. Guard is opt-in per route (not global), so existing expenses/categories endpoints stay unchanged for now.

## Wiring & config
- `app.module.ts`: import `UsersModule`, `AuthModule`.
- `.env.example` and `apps/api/.env`: add `JWT_SECRET` (dev value in `.env`, placeholder in example) and `JWT_EXPIRES_IN=1d`. Fail fast at startup if `JWT_SECRET` is missing.
- `packages/shared/src/index.ts`: add `User`, `AuthResponse` types (API uses `import type` only). Update CLAUDE.md architecture note briefly.
- All relative imports end in `.js` (ESM rule).

## Out of scope
Refresh tokens, password reset, email verification, linking expenses/categories to the authenticated user, and frontend login UI — can follow separately.

## Verification
1. `pnpm install`, `pnpm db:up`, `pnpm db:migrate`, `pnpm --filter @expense/api lint` and `pnpm build`.
2. `pnpm dev:api`, then with curl:
   - `POST /api/auth/register` → 201 with token; same email again → 409; weak password/invalid email → 400.
   - `POST /api/auth/login` → 200 with token; wrong password / unknown email → 401 same message.
   - `GET /api/users/me` with Bearer token → public user without `passwordHash`; without/invalid token → 401.
3. Check in `pnpm db:studio` that `passwordHash` is a bcrypt hash and `lastLoginAt` updates.
