# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Bakery is a pnpm + Turborepo monorepo for a recipe management app. See `README.md` and `.cursor/rules/bakery.mdc` for full details on structure, conventions, and commands.

### Services

| Service                | Type             | Notes                                                   |
| ---------------------- | ---------------- | ------------------------------------------------------- |
| **Next.js (apps/web)** | Local dev server | `pnpm dev` or `pnpm --filter web dev` — port 3000       |
| **Convex**             | External SaaS    | `pnpm convex:dev` — requires `CONVEX_DEPLOYMENT` secret |
| **Clerk**              | External SaaS    | No local process — requires publishable + secret keys   |

### Required secrets (env vars)

The app **cannot render any pages** without valid Clerk and Convex credentials. Clerk middleware validates the publishable key on every request, so even the splash page will 500 without real keys.

| Secret                              | Where                         | Purpose                                 |
| ----------------------------------- | ----------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_CONVEX_URL`            | `apps/web/.env.local`         | Convex deployment URL                   |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `apps/web/.env.local`         | Clerk public key                        |
| `CLERK_SECRET_KEY`                  | `apps/web/.env.local`         | Clerk server key                        |
| `CLERK_JWT_ISSUER_DOMAIN`           | `apps/web/.env.local`         | Clerk JWT domain                        |
| `CONVEX_DEPLOYMENT`                 | `packages/backend/.env.local` | Convex deployment ID (for `convex dev`) |
| `CONVEX_URL`                        | `packages/backend/.env.local` | Convex URL                              |

### Key commands

Standard commands are in root `package.json` scripts. Non-obvious notes:

- `pnpm build` will fail without a valid `NEXT_PUBLIC_CONVEX_URL` (Convex client requires an absolute URL at SSR time).
- `pnpm lint` runs only in `apps/web` (other packages have no lint script). There are pre-existing lint errors in the codebase.
- `pnpm typecheck` runs across all 3 packages and passes clean.

### Gotchas

- The `pnpm.onlyBuiltDependencies` field in root `package.json` allowlists build scripts for `@clerk/shared`, `esbuild`, `sharp`, and `unrs-resolver`. Without this, `pnpm install` will warn about ignored build scripts and native binaries won't be compiled.
- Clerk's middleware (`src/proxy.ts`) intercepts all non-static routes. The dev server will return 500 on all page requests if `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is missing or invalid.
- `.env.local` files (not committed) must be created from `.env.example` in both `apps/web/` and `packages/backend/`.
