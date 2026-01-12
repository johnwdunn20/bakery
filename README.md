# Bakery

A modern full-stack monorepo built with Next.js, Convex, and Tailwind CSS. Designed for rapid development with type-safe APIs and a beautiful UI.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Shadcn UI
- **Backend**: Convex (real-time database & serverless functions)
- **Authentication**: Clerk (user management & auth)
- **Tooling**: pnpm workspaces, Turborepo, TypeScript, Prettier, ESLint
- **Future**: Expo (React Native) mobile app ready

## Project Structure

```
bakery/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── src/
│   │   │   ├── app/            # App Router pages & layouts
│   │   │   ├── components/ui/  # Shadcn UI components
│   │   │   └── lib/            # Utilities
│   │   └── public/             # Static assets
│   └── mobile/                 # Future Expo app (placeholder)
├── packages/
│   ├── backend/                # @bakery/backend - Convex backend
│   │   └── convex/             # Schema & functions
│   └── shared/                 # @bakery/shared - Shared utilities
│       └── src/                # Validation, constants, types
└── [config files]              # Root configuration
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 8+
- [Convex account](https://convex.dev/) (free tier available)

## Available Scripts

Run these from the project root:

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `pnpm dev`           | Start all dev servers (Turborepo) |
| `pnpm build`         | Build all packages for production |
| `pnpm lint`          | Run ESLint across all packages    |
| `pnpm typecheck`     | Run TypeScript type checking      |
| `pnpm format`        | Format code with Prettier         |
| `pnpm format:check`  | Check code formatting             |
| `pnpm convex:dev`    | Start Convex dev server only      |
| `pnpm convex:deploy` | Deploy Convex to production       |

## Package Imports

Import from workspace packages using their scoped names:

```typescript
// Import Convex API (for queries/mutations)
import { api } from "@bakery/backend";

// Import shared utilities
import { emailSchema, APP_NAME } from "@bakery/shared";

// Import Shadcn components (within web app)
import { Button } from "@/components/ui/button";
```

## Adding Shadcn Components

From the `apps/web` directory:

```bash
pnpm dlx shadcn@latest add [component-name]
```

Example:

```bash
pnpm dlx shadcn@latest add dialog dropdown-menu toast
```

## Authentication

This project uses [Clerk](https://clerk.com/) for authentication, integrated with Convex for user data storage.

### How It Works

We use an **on-demand sync** approach:

1. User authenticates via Clerk (sign in/sign up)
2. Clerk provides a JWT token to the app
3. When the user accesses Convex, call `getOrCreateUser` to sync their data
4. User info is stored/updated in the Convex `users` table

This approach is simpler than webhooks and works well for most applications. User data syncs whenever they're active in the app.

### Syncing User Data

Call `getOrCreateUser` when you need to ensure the user exists in Convex:

```tsx
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@bakery/backend";
import { useEffect } from "react";

export function useCurrentUser() {
  const user = useQuery(api.users.getCurrentUser);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  useEffect(() => {
    // Sync user on first load if authenticated
    if (user === null) {
      getOrCreateUser();
    }
  }, [user, getOrCreateUser]);

  return user;
}
```

### Environment Variables

**For `apps/web/.env.local`:**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk issuer URL (e.g., `https://your-instance.clerk.accounts.dev`)

**For Convex Dashboard (Settings > Environment Variables):**

- `CLERK_JWT_ISSUER_DOMAIN` - Same issuer URL as above

### Future: Webhook Sync

For real-time sync even when users aren't active (e.g., admin updates, immediate deletion cleanup), you can implement Clerk webhooks. See [Clerk's webhook documentation](https://clerk.com/docs/integrations/webhooks) for details.

## Convex Development

### Define Your Schema

Edit `packages/backend/convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    price: v.number(),
    description: v.optional(v.string()),
  }),
});
```

### Create Functions

Add functions in `packages/backend/convex/`:

```typescript
// packages/backend/convex/products.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const create = mutation({
  args: { name: v.string(), price: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args);
  },
});
```

### Use in React

```tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@bakery/backend";

export function ProductList() {
  const products = useQuery(api.products.list);
  const createProduct = useMutation(api.products.create);

  return (
    <div>
      {products?.map((p) => (
        <div key={p._id}>{p.name}</div>
      ))}
    </div>
  );
}
```

## Adding New Packages

1. Create the package directory:

   ```bash
   mkdir -p packages/my-package/src
   cd packages/my-package
   pnpm init
   ```

2. Update `package.json`:

   ```json
   {
     "name": "@bakery/my-package",
     "exports": { ".": "./src/index.ts" }
   }
   ```

3. Create `tsconfig.json` extending the base config:

   ```json
   {
     "extends": "../../tsconfig.base.json",
     "include": ["src/**/*"]
   }
   ```

4. Add to consuming packages:

   ```json
   {
     "dependencies": {
       "@bakery/my-package": "workspace:*"
     }
   }
   ```

5. Run `pnpm install` from the root.

## Deployment

### Convex (Backend)

```bash
pnpm convex:deploy
```

### Vercel (Frontend)

1. Connect your repository to [Vercel](https://vercel.com)
2. Set the root directory to `apps/web`
3. Add environment variables:
   - `NEXT_PUBLIC_CONVEX_URL` - Your production Convex URL

## Next Steps

- [ ] Run `pnpm convex:dev` to initialize Convex
- [ ] Set environment variables (see Authentication section)
- [ ] Build out the web app UI with Shadcn components
- [ ] Set up the Expo mobile app in `apps/mobile/`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Shadcn UI](https://ui.shadcn.com)
- [Turborepo](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
