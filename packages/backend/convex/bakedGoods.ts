import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const createBakedGood = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const now = Date.now();
    return await ctx.db.insert("bakedGoods", {
      authorId: user._id,
      name: args.name,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createBakedGoodForSeed = internalMutation({
  args: {
    authorId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("bakedGoods", {
      authorId: args.authorId,
      name: args.name,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateBakedGood = mutation({
  args: {
    id: v.id("bakedGoods"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const bakedGood = await ctx.db.get(args.id);
    if (!bakedGood || bakedGood.authorId !== user._id) {
      throw new Error("Baked good not found or not owned by you");
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      updatedAt: now,
    });
    return args.id;
  },
});

export const deleteBakedGood = mutation({
  args: { id: v.id("bakedGoods") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const bakedGood = await ctx.db.get(args.id);
    if (!bakedGood || bakedGood.authorId !== user._id) {
      throw new Error("Baked good not found or not owned by you");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const listMyBakedGoods = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("bakedGoods")
      .withIndex("by_author", (q) => q.eq("authorId", user._id))
      .collect();
  },
});

export const getBakedGoodWithIterations = query({
  args: { id: v.id("bakedGoods") },
  handler: async (ctx, args) => {
    const bakedGood = await ctx.db.get(args.id);
    if (!bakedGood) return null;

    const iterations = await ctx.db
      .query("recipeIterations")
      .withIndex("by_baked_good", (q) => q.eq("bakedGoodId", args.id))
      .collect();

    return { ...bakedGood, iterations };
  },
});

export const listCommunityBakedGoods = query({
  args: {},
  handler: async (ctx) => {
    const list = await ctx.db.query("bakedGoods").collect();
    const bakedGoods = list.sort((a, b) => b.createdAt - a.createdAt).slice(0, 12);

    return await Promise.all(
      bakedGoods.map(async (bg) => {
        const author = await ctx.db.get(bg.authorId);
        return {
          ...bg,
          authorName: author?.name ?? author?.username ?? "Unknown Baker",
        };
      })
    );
  },
});
