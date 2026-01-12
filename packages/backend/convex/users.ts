import { mutation, query } from "./_generated/server";

/**
 * Get or create a user from the authenticated Clerk identity.
 * Call this when a user signs in to sync their data to Convex.
 */
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    const now = Date.now();

    if (existingUser) {
      // Update user if any info has changed
      const updates: Partial<{
        email: string;
        name: string | undefined;
        imageUrl: string | undefined;
        updatedAt: number;
      }> = {};

      if (identity.email && existingUser.email !== identity.email) {
        updates.email = identity.email;
      }
      if (identity.name !== existingUser.name) {
        updates.name = identity.name ?? undefined;
      }
      if (identity.pictureUrl !== existingUser.imageUrl) {
        updates.imageUrl = identity.pictureUrl ?? undefined;
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = now;
        await ctx.db.patch(existingUser._id, updates);
      }

      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId,
      email: identity.email ?? "",
      name: identity.name ?? undefined,
      imageUrl: identity.pictureUrl ?? undefined,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

/**
 * Get the current authenticated user from the database.
 * Returns null if not authenticated or user doesn't exist in database.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

/**
 * Get a user by their Clerk ID.
 */
export const getUserByClerkId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
