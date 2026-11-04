# Auth UI (register + login) in apps/web

## Context
The API already has `POST /api/auth/register` (`{email, name?, password(8–72)}`) and `POST /api/auth/login` (`{email, password}`), both returning `{ accessToken, user }` (`AuthResponse` in `@expense/shared`). The web app has no UI library, no Tailwind, no auth pages, and `src/lib/api.ts` drops API error bodies. We need register and login forms (shadcn UI, zod validation) that redirect to `/` on success.

## Approach

### 1. Tailwind + shadcn setup (apps/web)
- Add Tailwind v4: `tailwindcss`, `@tailwindcss/postcss`; create `postcss.config.mjs`.
- Replace `src/app/globals.css` with Tailwind import + shadcn theme variables (keep the existing `main` layout rules only if still needed).
- Run `pnpm dlx shadcn@latest init` in `apps/web` (alias `@/*` → `./src/*` already exists; produces `components.json`, `src/lib/utils.ts`, deps `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `tw-animate-css`).
- Add components: `button`, `input`, `label`, `card`, `form` (react-hook-form wrapper). If `form` is unavailable in the current registry, use `field` components.
- Add deps: `zod`, `react-hook-form`, `@hookform/resolvers`.

### 2. Validation schemas — `src/lib/schemas/auth.ts`
- `loginSchema`: `email` (trimmed, valid email), `password` (non-empty).
- `registerSchema`: `name` (trimmed, 1–100), `email` (valid), `password` (8–72, matching the API DTO).
- Export inferred types.

### 3. Auth transport and token storage
- Server Actions in `src/app/(auth)/actions.ts` (`'use server'`): `loginAction`, `registerAction`. Each re-validates with the zod schema, calls the API, and on success stores `accessToken` in an **httpOnly, sameSite=lax cookie** via `cookies()` from `next/headers` (secure in production), then `redirect('/')`. On failure they return `{ error }` (and field errors for 400s).
- Extend `src/lib/api.ts` so a failed response throws an `ApiError` carrying the status and the parsed `message` (Nest returns `message: string[] | string`), and set `Content-Type: application/json` when a body is present. This keeps the existing `/health` call working.
- Cookie-based, so no API CORS change is needed (calls happen server-to-server).

### 4. Pages and forms
- `src/app/(auth)/register/page.tsx` and `src/app/(auth)/login/page.tsx` (server pages) render client components:
  - `src/components/auth/register-form.tsx`: name, email, password. Uses react-hook-form with `zodResolver(registerSchema)`, submits to `registerAction`, shows server error (e.g. duplicate email) in an alert and field errors under the inputs, disables the button while pending. Link to `/login`.
  - `src/components/auth/login-form.tsx`: email, password, same pattern, shows "Invalid credentials". Link to `/register`.
- Both wrapped in shadcn `Card`, centered via `(auth)/layout.tsx`.
- Redirect to `/` after successful register and after login (done in the server actions).

### 5. Shared types
- Add `LoginRequest` and `RegisterRequest` to `packages/shared/src/index.ts` and use them in the web actions.

### 6. Docs
- Update CLAUDE.md "Architecture" with a line about the web auth pages, the cookie, and the shadcn/Tailwind setup.

## Out of scope (say if you want them)
Route protection (`proxy.ts`), logout, showing the signed-in user on `/`.

## Verification
- `pnpm install`, `pnpm db:up`, `pnpm db:migrate`, `pnpm dev`.
- `pnpm lint` and `pnpm build` pass.
- In the browser: `/register` rejects an empty name, a bad email, and a short password with inline zod errors; a valid submit creates the user, sets the cookie, and lands on `/`. Registering the same email again shows a server error. `/login` with a wrong password shows "Invalid credentials"; a correct one redirects to `/`.
