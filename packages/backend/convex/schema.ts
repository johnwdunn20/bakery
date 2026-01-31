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

  bakedGoods: defineTable({
    authorId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_author", ["authorId"]),

  recipeIterations: defineTable({
    bakedGoodId: v.id("bakedGoods"),
    recipeContent: v.string(),
    difficulty: v.string(),
    totalTime: v.number(),
    bakeDate: v.number(),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_baked_good", ["bakedGoodId"]),

  iterationPhotos: defineTable({
    iterationId: v.id("recipeIterations"),
    storageId: v.id("_storage"),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_iteration", ["iterationId"]),
});
