import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

/**
 * Sync the authenticated user from Clerk to Convex.
 * Creates a new user or updates existing user data.
 * Username is pulled from Clerk's identity (must be enabled in Clerk dashboard).
 */
export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;
    const email = identity.email ?? "";
    const username = identity.nickname;

    if (!username) {
      throw new Error("Username is required. Enable username in Clerk dashboard.");
    }

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
        username: string;
        name: string | undefined;
        imageUrl: string | undefined;
        updatedAt: number;
      }> = {};

      if (email && existingUser.email !== email) {
        // Check email uniqueness before updating
        const emailTaken = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .unique();
        if (emailTaken && emailTaken._id !== existingUser._id) {
          throw new Error("Email is already in use");
        }
        updates.email = email;
      }

      if (username !== existingUser.username) {
        // Check username uniqueness before updating
        const usernameTaken = await ctx.db
          .query("users")
          .withIndex("by_username", (q) => q.eq("username", username))
          .unique();
        if (usernameTaken && usernameTaken._id !== existingUser._id) {
          throw new Error("Username is already taken");
        }
        updates.username = username;
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

    // Check email uniqueness before creating
    if (email) {
      const emailTaken = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();
      if (emailTaken) {
        throw new Error("Email is already in use");
      }
    }

    // Check username uniqueness before creating
    const usernameTaken = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
    if (usernameTaken) {
      throw new Error("Username is already taken");
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      username,
      name: identity.name ?? undefined,
      imageUrl: identity.pictureUrl ?? undefined,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

/**
 * Get or create a seed user (for seed action only). Call via internal.users.getOrCreateSeedUser.
 * Idempotent: returns existing user id if username already exists.
 */
export const getOrCreateSeedUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (existing) return existing._id;
    const now = Date.now();
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      username: args.username,
      name: args.name,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getOrCreateSystemUser = mutation({
  args: {},
  handler: async (ctx) => {
    const systemUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", "bakery_system"))
      .unique();

    if (systemUser) return systemUser._id;

    const now = Date.now();
    return await ctx.db.insert("users", {
      clerkId: "system",
      email: "system@bakery.app",
      username: "bakery_system",
      name: "Bakery System",
      createdAt: now,
      updatedAt: now,
    });
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
