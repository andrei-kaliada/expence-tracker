# Expense Tracker

Monorepo (pnpm workspaces):

- `apps/web` – Next.js frontend (http://localhost:3000)
- `apps/api` – NestJS backend, Prisma + PostgreSQL (http://localhost:4000/api)
- `packages/shared` – shared TypeScript types (`@expense/shared`)

## Setup

```bash
corepack enable
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm install
pnpm db:up
pnpm db:migrate
pnpm dev
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run web and api in parallel |
| `pnpm db:up` / `db:down` | Start/stop local Postgres |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm build` / `lint` | Build / lint all packages |
