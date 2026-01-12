# Clerk-Convex Integration Plan

## Overview
Complete the integration between Clerk and Convex to enable authenticated Convex queries/mutations and automatically sync user data from Clerk to Convex. This will allow storing user information in Convex and accessing authenticated user context in Convex functions.

## Current State Analysis
- Clerk is installed and configured in Next.js app (`apps/web`)
- `auth.config.ts` exists but uses incorrect environment variable (`CLERK_FRONTEND_API_URL` instead of `CLERK_JWT_ISSUER_DOMAIN`)
- Convex schema is empty (no tables defined)
- Convex provider uses basic `ConvexProvider` instead of `ConvexProviderWithClerk`
- No webhook handlers for syncing Clerk user data to Convex

## Implementation Steps

### 1. Fix Auth Configuration
- Update `packages/backend/convex/auth.config.ts` to use correct environment variable `CLERK_JWT_ISSUER_DOMAIN`
- Document that this should be set to Clerk's JWT Issuer URL (from Clerk Dashboard → Configure → Session Management → JWT Templates)

### 2. Create Users Table Schema
- Add `users` table to `packages/backend/convex/schema.ts` with fields:
  - `clerkUserId` (string, indexed) - Clerk user ID
  - `email` (string, indexed) - Primary email
  - `firstName` (optional string)
  - `lastName` (optional string)
  - `imageUrl` (optional string) - Profile picture URL
  - `createdAt` (number) - Timestamp
  - `updatedAt` (number) - Timestamp
- Add index on `clerkUserId` for fast lookups
- Add index on `email` for email-based queries

### 3. Update Convex Provider to Use Clerk
- Modify `apps/web/src/app/providers.tsx` to:
  - Import `ConvexProviderWithClerk` from `convex/react-clerk`
  - Import `useAuth` from `@clerk/nextjs`
  - Replace `ConvexProvider` with `ConvexProviderWithClerk`
  - Pass `useAuth` hook to `ConvexProviderWithClerk`
- Note: Since `ClerkProvider` is already in `layout.tsx`, we can use `useAuth` in the providers component

### 4. Create User Sync Functions
- Create `packages/backend/convex/users.ts` with:
  - `getCurrentUser` query - Get current authenticated user using `ctx.auth.getUserIdentity()`
  - `getByClerkId` query - Get user by Clerk ID
  - `getByEmail` query - Get user by email
  - `create` mutation - Create user record (for webhook)
  - `update` mutation - Update user record (for webhook)
  - `delete` mutation - Delete user record (for webhook)

### 5. Create Webhook Handler
- Create `packages/backend/convex/webhooks.ts` HTTP action to handle Clerk webhooks:
  - Verify webhook signature (security)
  - Handle `user.created` event - create user in Convex
  - Handle `user.updated` event - update user in Convex
  - Handle `user.deleted` event - delete user from Convex
  - Return appropriate HTTP responses

### 6. Environment Variables Documentation
- Document required environment variables:
  - `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT Issuer URL (for Convex auth)
  - `CLERK_WEBHOOK_SECRET` - Clerk webhook signing secret (for webhook verification)
  - Note: These should be set in Convex dashboard, not `.env.local`

## Files to Create/Modify

1. **`packages/backend/convex/auth.config.ts`**
   - Fix environment variable name

2. **`packages/backend/convex/schema.ts`**
   - Add `users` table definition with indexes

3. **`packages/backend/convex/users.ts`** (new file)
   - User query and mutation functions

4. **`packages/backend/convex/webhooks.ts`** (new file)
   - HTTP action for Clerk webhooks

5. **`apps/web/src/app/providers.tsx`**
   - Update to use `ConvexProviderWithClerk`

## Architecture Flow

```
Clerk Authentication Flow:
1. User signs in via Clerk → ClerkProvider authenticates
2. ConvexProviderWithClerk gets auth token from Clerk
3. Convex functions receive authenticated context via ctx.auth.getUserIdentity()

User Sync Flow:
1. User created/updated/deleted in Clerk
2. Clerk sends webhook to Convex HTTP action
3. Webhook handler verifies signature and syncs data to Convex users table
4. Convex queries can now access user data
```

## Security Considerations

- Webhook signature verification is critical to prevent unauthorized user creation/updates
- Clerk JWT issuer domain must be correctly configured
- User data sync happens server-side only (webhook handler)

## Verification Checklist

After implementation:
- ✅ `auth.config.ts` uses `CLERK_JWT_ISSUER_DOMAIN`
- ✅ Users table schema defined with proper indexes
- ✅ `ConvexProviderWithClerk` used instead of `ConvexProvider`
- ✅ User sync functions created (getCurrentUser, getByClerkId, getByEmail, create, update, delete)
- ✅ Webhook handler created with signature verification
- ✅ Environment variables documented

## Next Steps for User

After implementation:
1. Get Clerk JWT Issuer URL from Clerk Dashboard (Configure → Session Management → JWT Templates → create "convex" template)
2. Set `CLERK_JWT_ISSUER_DOMAIN` in Convex dashboard environment variables
3. Create Clerk webhook pointing to Convex HTTP action endpoint
4. Get webhook signing secret and set `CLERK_WEBHOOK_SECRET` in Convex dashboard
5. Test authentication flow and user sync
