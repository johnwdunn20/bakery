import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  recipes: defineTable({
    authorId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_author", ["authorId"]),

  variants: defineTable({
    recipeId: v.id("recipes"),
    name: v.string(),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_recipe", ["recipeId"]),

  ingredients: defineTable({
    variantId: v.id("variants"),
    name: v.string(),
    amount: v.number(),
    unit: v.string(),
    isFlour: v.boolean(),
    isLiquid: v.boolean(),
    order: v.number(),
  }).index("by_variant", ["variantId"]),
});
