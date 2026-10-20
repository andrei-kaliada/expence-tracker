# Plan: Categories API (create / update / delete / search) with CQRS (apps/api)

## Context
`GET /api/categories` existed as a plain service. We need write endpoints and a search by name, using the same CQRS pattern as the `users` module (`UsersRepository` + commands/queries on `@nestjs/cqrs`). Write and search endpoints require auth (`JwtAuthGuard`) and are owner-scoped.

## Structure — `apps/api/src/categories/`
- `categories.repository.ts` — only place that touches Prisma: `findAllByUser(userId)`, `findOwned(id, userId)`, `searchByName(userId, name)` (case-insensitive `contains`), `create`, `update`, `delete`.
- `commands/`
  - `create-category.command.ts` — saves with `userId` of the caller.
  - `update-category.command.ts` — `NotFoundException` if the category isn't owned by the caller.
  - `delete-category.command.ts` — same ownership check.
- `queries/`
  - `list-categories.query.ts` — caller's categories sorted by name.
  - `find-categories-by-name.query.ts` — caller's categories matching the name, sorted by name.
- `dto/` — `create-category.dto.ts` (`name` 1–50, optional `color` hex), `update-category.dto.ts` (both optional), `search-categories.dto.ts` (`name` 1–50).
- `categories.controller.ts` — dispatches to `CommandBus` / `QueryBus` only.
- `categories.module.ts` — imports `CqrsModule` and `AuthGuardsModule`; registers repository and all handlers.
- `categories.service.ts` removed.

## Endpoints
| Method | Path | Auth | Result |
|---|---|---|---|
| GET | `/api/categories` | Bearer | caller's categories |
| GET | `/api/categories/search?name=` | Bearer | caller's matches (declared before `:id` routes) |
| POST | `/api/categories` | Bearer | 201, new category |
| PATCH | `/api/categories/:id` | Bearer | updated category; 404 if not owned |
| DELETE | `/api/categories/:id` | Bearer | 204; 404 if not owned |

`:id` uses `ParseUUIDPipe` (400 on bad id).

## Docs
`CLAUDE.md` architecture note mentions categories follow the repository + commands/queries pattern.

## Open decisions
- Search is partial match; an exact-match variant can be added if needed.

## Verification
1. `npx tsc --noEmit` and `npx nest build` in `apps/api` (or `pnpm lint` / `pnpm build`); `pnpm db:up` first.
2. Run the API and with curl and two registered users:
   - GET list without token → 401; with token → only the caller's categories.
   - POST without token → 401; with token → 201 containing the caller's `userId`; bad color → 400.
   - PATCH/DELETE own category → 200 / 204; the other user → 404; deleting twice → 404; non-UUID id → 400.
   - Search `?name=FOOD` returns `Fast-food` and `Food` for the owner only; no match → `[]`; missing name → 400; no token → 401.
3. Remove the test users afterwards.

## Status
Implemented and verified (all checks above passed).
