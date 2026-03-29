import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";
import type { Id } from "./_generated/dataModel";

const modules = import.meta.glob("./**/*.ts");

function identity(clerkId: string, nickname: string) {
  return {
    subject: clerkId,
    email: `${nickname}@test.com`,
    nickname,
    name: nickname,
  };
}

async function seedUser(
  t: ReturnType<typeof convexTest>,
  clerkId: string,
  username: string
): Promise<Id<"users">> {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      clerkId,
      email: `${username}@test.com`,
      username,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });
}

// --- createBakedGood ---

describe("bakedGoods.createBakedGood", () => {
  it("throws when not authenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(api.bakedGoods.createBakedGood, { name: "Bread" })).rejects.toThrow(
      "Not authenticated"
    );
  });

  it("creates a baked good for an authenticated user", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "clerk_1", "baker");

    const asUser = t.withIdentity(identity("clerk_1", "baker"));
    const id = await asUser.mutation(api.bakedGoods.createBakedGood, {
      name: "Sourdough",
      description: "A classic loaf",
    });
    expect(id).toBeDefined();
  });

  it("throws for empty name", async () => {
    const t = convexTest(schema, modules);
    await seedUser(t, "clerk_1", "baker");

    const asUser = t.withIdentity(identity("clerk_1", "baker"));
    await expect(asUser.mutation(api.bakedGoods.createBakedGood, { name: "   " })).rejects.toThrow(
      "Name cannot be empty"
    );
  });
});

// --- listMyBakedGoods ---

describe("bakedGoods.listMyBakedGoods", () => {
  it("returns empty array when not authenticated", async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.bakedGoods.listMyBakedGoods);
    expect(result).toEqual([]);
  });

  it("returns only the current user's baked goods", async () => {
    const t = convexTest(schema, modules);
    const user1Id = await seedUser(t, "clerk_1", "baker1");
    const user2Id = await seedUser(t, "clerk_2", "baker2");

    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.insert("bakedGoods", {
        authorId: user1Id,
        name: "My Bread",
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("bakedGoods", {
        authorId: user2Id,
        name: "Other Bread",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser1 = t.withIdentity(identity("clerk_1", "baker1"));
    const result = await asUser1.query(api.bakedGoods.listMyBakedGoods);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("My Bread");
  });
});

// --- updateBakedGood ---

describe("bakedGoods.updateBakedGood", () => {
  it("updates the baked good name", async () => {
    const t = convexTest(schema, modules);
    const userId = await seedUser(t, "clerk_1", "baker");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Old Name",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser = t.withIdentity(identity("clerk_1", "baker"));
    await asUser.mutation(api.bakedGoods.updateBakedGood, { id: bgId, name: "New Name" });

    const updated = await asUser.query(api.bakedGoods.getBakedGood, { id: bgId });
    expect(updated!.name).toBe("New Name");
  });

  it("throws when updating another user's baked good", async () => {
    const t = convexTest(schema, modules);
    const user1Id = await seedUser(t, "clerk_1", "baker1");
    await seedUser(t, "clerk_2", "baker2");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: user1Id,
        name: "User1 Bread",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser2 = t.withIdentity(identity("clerk_2", "baker2"));
    await expect(
      asUser2.mutation(api.bakedGoods.updateBakedGood, { id: bgId, name: "Stolen" })
    ).rejects.toThrow("not owned by you");
  });
});

// --- deleteBakedGood (cascade) ---

describe("bakedGoods.deleteBakedGood", () => {
  it("deletes the baked good and cascades to iterations", async () => {
    const t = convexTest(schema, modules);
    const userId = await seedUser(t, "clerk_1", "baker");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Doomed Bread",
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("recipeIterations", {
        bakedGoodId: bgId,
        recipeContent: "Mix and bake",
        difficulty: "Easy",
        totalTime: 60,
        bakeDate: now,
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser = t.withIdentity(identity("clerk_1", "baker"));
    await asUser.mutation(api.bakedGoods.deleteBakedGood, { id: bgId });

    const result = await asUser.query(api.bakedGoods.listMyBakedGoods);
    expect(result).toHaveLength(0);
  });

  it("throws when deleting another user's baked good", async () => {
    const t = convexTest(schema, modules);
    const user1Id = await seedUser(t, "clerk_1", "baker1");
    await seedUser(t, "clerk_2", "baker2");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: user1Id,
        name: "Protected Bread",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser2 = t.withIdentity(identity("clerk_2", "baker2"));
    await expect(asUser2.mutation(api.bakedGoods.deleteBakedGood, { id: bgId })).rejects.toThrow(
      "not owned by you"
    );
  });
});

// --- createIteration ---

describe("bakedGoods.createIteration", () => {
  it("creates an iteration for an owned baked good", async () => {
    const t = convexTest(schema, modules);
    const userId = await seedUser(t, "clerk_1", "baker");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Test Bread",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser = t.withIdentity(identity("clerk_1", "baker"));
    const iterId = await asUser.mutation(api.bakedGoods.createIteration, {
      bakedGoodId: bgId,
      recipeContent: "Step 1: Mix. Step 2: Bake.",
      difficulty: "Medium",
      totalTime: 90,
      bakeDate: Date.now(),
      rating: 4,
      notes: "Good crumb",
    });
    expect(iterId).toBeDefined();
  });

  it("rejects a negative totalTime", async () => {
    const t = convexTest(schema, modules);
    const userId = await seedUser(t, "clerk_1", "baker");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Test Bread",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser = t.withIdentity(identity("clerk_1", "baker"));
    await expect(
      asUser.mutation(api.bakedGoods.createIteration, {
        bakedGoodId: bgId,
        recipeContent: "Recipe",
        difficulty: "Easy",
        totalTime: -10,
        bakeDate: Date.now(),
      })
    ).rejects.toThrow("Total time cannot be negative");
  });

  it("rejects an invalid rating", async () => {
    const t = convexTest(schema, modules);
    const userId = await seedUser(t, "clerk_1", "baker");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Test Bread",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser = t.withIdentity(identity("clerk_1", "baker"));
    await expect(
      asUser.mutation(api.bakedGoods.createIteration, {
        bakedGoodId: bgId,
        recipeContent: "Recipe",
        difficulty: "Easy",
        totalTime: 60,
        bakeDate: Date.now(),
        rating: 10,
      })
    ).rejects.toThrow("Rating must be between 1 and 5");
  });
});

// --- duplicateIteration ---

describe("bakedGoods.duplicateIteration", () => {
  it("duplicates an iteration with today's date", async () => {
    const t = convexTest(schema, modules);
    const userId = await seedUser(t, "clerk_1", "baker");

    let iterId!: Id<"recipeIterations">;
    await t.run(async (ctx) => {
      const now = Date.now();
      const bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Test Bread",
        createdAt: now,
        updatedAt: now,
      });
      iterId = await ctx.db.insert("recipeIterations", {
        bakedGoodId: bgId,
        recipeContent: "Original recipe",
        difficulty: "Hard",
        totalTime: 180,
        bakeDate: new Date("2024-01-01").getTime(),
        rating: 5,
        notes: "Perfect",
        sourceUrl: "https://example.com",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser = t.withIdentity(identity("clerk_1", "baker"));
    const newIterId = await asUser.mutation(api.bakedGoods.duplicateIteration, { id: iterId });
    expect(newIterId).toBeDefined();
    expect(newIterId).not.toEqual(iterId);
  });
});

// --- getBakedGoodWithIterations ---

describe("bakedGoods.getBakedGoodWithIterations", () => {
  it("returns null when not authenticated", async () => {
    const t = convexTest(schema, modules);

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        clerkId: "clerk_1",
        email: "test@test.com",
        username: "baker",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Bread",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    const result = await t.query(api.bakedGoods.getBakedGoodWithIterations, { id: bgId });
    expect(result).toBeNull();
  });

  it("returns baked good with aggregated stats", async () => {
    const t = convexTest(schema, modules);
    const userId = await seedUser(t, "clerk_1", "baker");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Test Bread",
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("recipeIterations", {
        bakedGoodId: bgId,
        recipeContent: "Iteration 1",
        difficulty: "Easy",
        totalTime: 60,
        bakeDate: new Date("2024-01-01").getTime(),
        rating: 3,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("recipeIterations", {
        bakedGoodId: bgId,
        recipeContent: "Iteration 2",
        difficulty: "Medium",
        totalTime: 90,
        bakeDate: new Date("2024-06-15").getTime(),
        rating: 5,
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser = t.withIdentity(identity("clerk_1", "baker"));
    const result = await asUser.query(api.bakedGoods.getBakedGoodWithIterations, { id: bgId });

    expect(result).not.toBeNull();
    expect(result!.iterationCount).toBe(2);
    expect(result!.avgRating).toBe(4);
    expect(result!.bestRating).toBe(5);
    expect(result!.iterations).toHaveLength(2);
  });
});

// --- listCommunityBakedGoods ---

describe("bakedGoods.listCommunityBakedGoods", () => {
  it("returns only public baked goods without authentication", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        clerkId: "clerk_1",
        email: "community@test.com",
        username: "communityBaker",
        name: "Community Baker",
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Community Bread",
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      });
    });

    const result = await t.query(api.bakedGoods.listCommunityBakedGoods);
    expect(result).toHaveLength(1);
    expect(result[0].authorName).toBe("Community Baker");
  });

  it("excludes non-public baked goods", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        clerkId: "clerk_1",
        email: "private@test.com",
        username: "privateBaker",
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Private Bread",
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Also Private",
        isPublic: false,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Public Bread",
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      });
    });

    const result = await t.query(api.bakedGoods.listCommunityBakedGoods);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Public Bread");
  });

  it("limits to 12 results", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        clerkId: "clerk_1",
        email: "prolific@test.com",
        username: "prolificBaker",
        createdAt: now,
        updatedAt: now,
      });
      for (let i = 0; i < 20; i++) {
        await ctx.db.insert("bakedGoods", {
          authorId: userId,
          name: `Bread ${i}`,
          isPublic: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    const result = await t.query(api.bakedGoods.listCommunityBakedGoods);
    expect(result).toHaveLength(12);
  });
});

// --- publishBakedGood ---

describe("bakedGoods.publishBakedGood", () => {
  it("throws when not authenticated", async () => {
    const t = convexTest(schema, modules);
    const userId = await seedUser(t, "clerk_1", "baker");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Bread",
        createdAt: now,
        updatedAt: now,
      });
    });

    await expect(
      t.mutation(api.bakedGoods.publishBakedGood, { id: bgId, isPublic: true })
    ).rejects.toThrow("Not authenticated");
  });

  it("throws when publishing another user's baked good", async () => {
    const t = convexTest(schema, modules);
    const user1Id = await seedUser(t, "clerk_1", "baker1");
    await seedUser(t, "clerk_2", "baker2");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: user1Id,
        name: "User1 Bread",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser2 = t.withIdentity(identity("clerk_2", "baker2"));
    await expect(
      asUser2.mutation(api.bakedGoods.publishBakedGood, { id: bgId, isPublic: true })
    ).rejects.toThrow("not owned by you");
  });

  it("publishes and unpublishes a baked good", async () => {
    const t = convexTest(schema, modules);
    const userId = await seedUser(t, "clerk_1", "baker");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Toggle Bread",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser = t.withIdentity(identity("clerk_1", "baker"));

    // Initially not public — should not appear in community
    let community = await t.query(api.bakedGoods.listCommunityBakedGoods);
    expect(community).toHaveLength(0);

    // Publish
    await asUser.mutation(api.bakedGoods.publishBakedGood, { id: bgId, isPublic: true });
    community = await t.query(api.bakedGoods.listCommunityBakedGoods);
    expect(community).toHaveLength(1);
    expect(community[0].name).toBe("Toggle Bread");

    // Unpublish
    await asUser.mutation(api.bakedGoods.publishBakedGood, { id: bgId, isPublic: false });
    community = await t.query(api.bakedGoods.listCommunityBakedGoods);
    expect(community).toHaveLength(0);
  });
});

// --- createBakedGoodForSeed (internal) ---

describe("bakedGoods.createBakedGoodForSeed", () => {
  it("creates a baked good without auth", async () => {
    const t = convexTest(schema, modules);
    const userId = await seedUser(t, "clerk_1", "baker");

    const bgId = await t.mutation(internal.bakedGoods.createBakedGoodForSeed, {
      authorId: userId,
      name: "Seeded Bread",
      description: "From seed script",
    });
    expect(bgId).toBeDefined();
  });

  it("is idempotent for the same author and name", async () => {
    const t = convexTest(schema, modules);
    const userId = await seedUser(t, "clerk_1", "baker");

    const id1 = await t.mutation(internal.bakedGoods.createBakedGoodForSeed, {
      authorId: userId,
      name: "Seeded Bread",
    });
    const id2 = await t.mutation(internal.bakedGoods.createBakedGoodForSeed, {
      authorId: userId,
      name: "Seeded Bread",
    });
    expect(id1).toEqual(id2);
  });
});

// --- getCommunityBakedGoodWithIterations ---

describe("bakedGoods.getCommunityBakedGoodWithIterations", () => {
  it("returns null for non-public baked good", async () => {
    const t = convexTest(schema, modules);

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        clerkId: "clerk_1",
        email: "test@test.com",
        username: "baker",
        createdAt: now,
        updatedAt: now,
      });
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Private Bread",
        createdAt: now,
        updatedAt: now,
      });
    });

    const result = await t.query(api.bakedGoods.getCommunityBakedGoodWithIterations, { id: bgId });
    expect(result).toBeNull();
  });

  it("returns public baked good with iterations", async () => {
    const t = convexTest(schema, modules);

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        clerkId: "clerk_1",
        email: "test@test.com",
        username: "baker",
        name: "Test Baker",
        createdAt: now,
        updatedAt: now,
      });
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Community Bread",
        description: "Shared recipe",
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("recipeIterations", {
        bakedGoodId: bgId,
        recipeContent: "Mix and bake",
        difficulty: "Easy",
        totalTime: 60,
        bakeDate: now,
        rating: 4,
        notes: "Good first try",
        createdAt: now,
        updatedAt: now,
      });
    });

    const result = await t.query(api.bakedGoods.getCommunityBakedGoodWithIterations, { id: bgId });
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Community Bread");
    expect(result!.authorName).toBe("Test Baker");
    expect(result!.iterations).toHaveLength(1);
    expect(result!.iterations[0].recipeContent).toBe("Mix and bake");
    expect(result!.avgRating).toBe(4);
  });
});

// --- forkBakedGood ---

describe("bakedGoods.forkBakedGood", () => {
  it("throws when not authenticated", async () => {
    const t = convexTest(schema, modules);

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        clerkId: "clerk_1",
        email: "test@test.com",
        username: "baker",
        createdAt: now,
        updatedAt: now,
      });
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: userId,
        name: "Public Bread",
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      });
    });

    await expect(t.mutation(api.bakedGoods.forkBakedGood, { id: bgId })).rejects.toThrow(
      "Not authenticated"
    );
  });

  it("throws for non-public baked good", async () => {
    const t = convexTest(schema, modules);
    const user1Id = await seedUser(t, "clerk_1", "baker1");
    await seedUser(t, "clerk_2", "baker2");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: user1Id,
        name: "Private Bread",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser2 = t.withIdentity(identity("clerk_2", "baker2"));
    await expect(asUser2.mutation(api.bakedGoods.forkBakedGood, { id: bgId })).rejects.toThrow(
      "not public"
    );
  });

  it("forks a public baked good with iterations", async () => {
    const t = convexTest(schema, modules);
    const user1Id = await seedUser(t, "clerk_1", "baker1");
    await seedUser(t, "clerk_2", "baker2");

    let bgId!: Id<"bakedGoods">;
    await t.run(async (ctx) => {
      const now = Date.now();
      bgId = await ctx.db.insert("bakedGoods", {
        authorId: user1Id,
        name: "Public Bread",
        description: "Great recipe",
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("recipeIterations", {
        bakedGoodId: bgId,
        recipeContent: "Original recipe content",
        difficulty: "Medium",
        totalTime: 120,
        bakeDate: now,
        rating: 5,
        notes: "Perfect",
        createdAt: now,
        updatedAt: now,
      });
    });

    const asUser2 = t.withIdentity(identity("clerk_2", "baker2"));
    const forkedId = await asUser2.mutation(api.bakedGoods.forkBakedGood, { id: bgId });
    expect(forkedId).toBeDefined();
    expect(forkedId).not.toEqual(bgId);

    const forked = await asUser2.query(api.bakedGoods.getBakedGoodWithIterations, { id: forkedId });
    expect(forked).not.toBeNull();
    expect(forked!.name).toBe("Public Bread");
    expect(forked!.description).toBe("Great recipe");
    expect(forked!.iterations).toHaveLength(1);
    expect(forked!.iterations[0].recipeContent).toBe("Original recipe content");
  });

  it("copies photo references when forking", async () => {
    const t = convexTest(schema, modules);
    const user1Id = await seedUser(t, "clerk_1", "baker1");
    await seedUser(t, "clerk_2", "baker2");

    let bgId!: Id<"bakedGoods">;
    let sourceIterationId!: Id<"recipeIterations">;
    let coverStorageId!: Id<"_storage">;
    let photoStorageId1!: Id<"_storage">;
    let photoStorageId2!: Id<"_storage">;

    await t.run(async (ctx) => {
      const now = Date.now();
      coverStorageId = (await ctx.storage.store(new Blob(["cover"]))) as Id<"_storage">;
      photoStorageId1 = (await ctx.storage.store(new Blob(["photo1"]))) as Id<"_storage">;
      photoStorageId2 = (await ctx.storage.store(new Blob(["photo2"]))) as Id<"_storage">;

      bgId = await ctx.db.insert("bakedGoods", {
        authorId: user1Id,
        name: "Photo Bread",
        isPublic: true,
        coverPhotoStorageId: coverStorageId,
        createdAt: now,
        updatedAt: now,
      });
      sourceIterationId = await ctx.db.insert("recipeIterations", {
        bakedGoodId: bgId,
        recipeContent: "Recipe with photos",
        difficulty: "Easy",
        totalTime: 60,
        bakeDate: now,
        firstPhotoStorageId: photoStorageId1,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("iterationPhotos", {
        iterationId: sourceIterationId,
        storageId: photoStorageId1,
        order: 0,
        createdAt: now,
      });
      await ctx.db.insert("iterationPhotos", {
        iterationId: sourceIterationId,
        storageId: photoStorageId2,
        order: 1,
        createdAt: now,
      });
    });

    const asUser2 = t.withIdentity(identity("clerk_2", "baker2"));
    const forkedId = await asUser2.mutation(api.bakedGoods.forkBakedGood, { id: bgId });

    await t.run(async (ctx) => {
      const forkedBg = await ctx.db.get(forkedId);
      expect(forkedBg).not.toBeNull();
      expect(forkedBg!.coverPhotoStorageId).toEqual(coverStorageId);

      const forkedIterations = await ctx.db
        .query("recipeIterations")
        .withIndex("by_baked_good", (q) => q.eq("bakedGoodId", forkedId))
        .collect();
      expect(forkedIterations).toHaveLength(1);
      expect(forkedIterations[0].firstPhotoStorageId).toEqual(photoStorageId1);

      const forkedPhotos = await ctx.db
        .query("iterationPhotos")
        .withIndex("by_iteration", (q) => q.eq("iterationId", forkedIterations[0]._id))
        .collect();
      expect(forkedPhotos).toHaveLength(2);
      forkedPhotos.sort((a, b) => a.order - b.order);
      expect(forkedPhotos[0].storageId).toEqual(photoStorageId1);
      expect(forkedPhotos[0].order).toBe(0);
      expect(forkedPhotos[1].storageId).toEqual(photoStorageId2);
      expect(forkedPhotos[1].order).toBe(1);

      // Forked photos should reference different iterationPhotos rows than the source
      const sourcePhotos = await ctx.db
        .query("iterationPhotos")
        .withIndex("by_iteration", (q) => q.eq("iterationId", sourceIterationId))
        .collect();
      expect(sourcePhotos).toHaveLength(2);
      const sourcePhotoIds = new Set(sourcePhotos.map((p) => p._id));
      for (const fp of forkedPhotos) {
        expect(sourcePhotoIds.has(fp._id)).toBe(false);
      }
    });
  });
});
