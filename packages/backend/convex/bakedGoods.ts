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

    const rawIterations = await ctx.db
      .query("recipeIterations")
      .withIndex("by_baked_good", (q) => q.eq("bakedGoodId", args.id))
      .collect();

    const iterations = rawIterations.sort((a, b) => b.bakeDate - a.bakeDate);

    const ratings = iterations
      .map((i) => i.rating)
      .filter((r): r is number => r != null);
    const iterationCount = iterations.length;
    const avgRating =
      ratings.length > 0 ? ratings.reduce((s, r) => s + r, 0) / ratings.length : null;
    const bestRating = ratings.length > 0 ? Math.max(...ratings) : null;
    const lastBakedDate = iterations.length > 0 ? Math.max(...iterations.map((i) => i.bakeDate)) : null;

    return {
      ...bakedGood,
      iterations,
      iterationCount,
      avgRating,
      bestRating,
      lastBakedDate,
    };
  },
});

export const getIteration = query({
  args: { id: v.id("recipeIterations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const iteration = await ctx.db.get(args.id);
    if (!iteration) return null;

    const bakedGood = await ctx.db.get(iteration.bakedGoodId);
    if (!bakedGood || bakedGood.authorId !== user._id) return null;

    const photos = await ctx.db
      .query("iterationPhotos")
      .withIndex("by_iteration", (q) => q.eq("iterationId", args.id))
      .collect();
    photos.sort((a, b) => a.order - b.order);

    return {
      ...iteration,
      photos: photos.map((p) => ({ _id: p._id, storageId: p.storageId, order: p.order })),
    };
  },
});

export const createIteration = mutation({
  args: {
    bakedGoodId: v.id("bakedGoods"),
    recipeContent: v.string(),
    difficulty: v.string(),
    totalTime: v.number(),
    bakeDate: v.number(),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const bakedGood = await ctx.db.get(args.bakedGoodId);
    if (!bakedGood || bakedGood.authorId !== user._id) {
      throw new Error("Baked good not found or not owned by you");
    }

    const now = Date.now();
    return await ctx.db.insert("recipeIterations", {
      bakedGoodId: args.bakedGoodId,
      recipeContent: args.recipeContent,
      difficulty: args.difficulty,
      totalTime: args.totalTime,
      bakeDate: args.bakeDate,
      rating: args.rating,
      notes: args.notes,
      sourceUrl: args.sourceUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateIteration = mutation({
  args: {
    id: v.id("recipeIterations"),
    recipeContent: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    totalTime: v.optional(v.number()),
    bakeDate: v.optional(v.number()),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    const iteration = await ctx.db.get(args.id);
    if (!iteration) throw new Error("Iteration not found");
    const bakedGood = await ctx.db.get(iteration.bakedGoodId);
    if (!bakedGood || bakedGood.authorId !== user._id) {
      throw new Error("Iteration not found or not owned by you");
    }
    const now = Date.now();
    await ctx.db.patch(args.id, {
      ...(args.recipeContent !== undefined && { recipeContent: args.recipeContent }),
      ...(args.difficulty !== undefined && { difficulty: args.difficulty }),
      ...(args.totalTime !== undefined && { totalTime: args.totalTime }),
      ...(args.bakeDate !== undefined && { bakeDate: args.bakeDate }),
      ...(args.rating !== undefined && { rating: args.rating }),
      ...(args.notes !== undefined && { notes: args.notes }),
      ...(args.sourceUrl !== undefined && { sourceUrl: args.sourceUrl }),
      updatedAt: now,
    });
    return args.id;
  },
});

export const deleteIteration = mutation({
  args: { id: v.id("recipeIterations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    const iteration = await ctx.db.get(args.id);
    if (!iteration) throw new Error("Iteration not found");
    const bakedGood = await ctx.db.get(iteration.bakedGoodId);
    if (!bakedGood || bakedGood.authorId !== user._id) {
      throw new Error("Iteration not found or not owned by you");
    }
    await ctx.db.delete(args.id);
    return args.id;
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
