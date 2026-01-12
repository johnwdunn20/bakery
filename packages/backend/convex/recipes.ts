import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createRecipe = mutation({
  args: {
    authorId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("recipes", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createVariant = mutation({
  args: {
    recipeId: v.id("recipes"),
    name: v.string(),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("variants", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const addIngredient = mutation({
  args: {
    variantId: v.id("variants"),
    name: v.string(),
    amount: v.number(),
    unit: v.string(),
    isFlour: v.boolean(),
    isLiquid: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ingredients", args);
  },
});

export const listCommunityRecipes = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_author") // We might want a "by_published" index later
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    return await Promise.all(
      recipes.map(async (recipe) => {
        const author = await ctx.db.get(recipe.authorId);
        const variant = await ctx.db
          .query("variants")
          .withIndex("by_recipe", (q) => q.eq("recipeId", recipe._id))
          .first();
        
        let imageUrl = null;
        if (variant?.imageStorageId) {
          imageUrl = await ctx.storage.getUrl(variant.imageStorageId);
        }

        return {
          ...recipe,
          authorName: author?.name ?? author?.username ?? "Unknown Baker",
          imageUrl,
          variantName: variant?.name,
        };
      })
    );
  },
});
