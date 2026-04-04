import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

describe("seed.run", () => {
  it("creates seed users, baked goods, and iterations", async () => {
    const t = convexTest(schema, modules);
    const result = await t.action(api.seed.run, {});
    expect(result).toEqual({ success: true });

    const counts = await t.run(async (ctx) => {
      const users = await ctx.db.query("users").collect();
      const bakedGoods = await ctx.db.query("bakedGoods").collect();
      const iterations = await ctx.db.query("recipeIterations").collect();
      return {
        users: users.length,
        bakedGoods: bakedGoods.length,
        iterations: iterations.length,
      };
    });

    expect(counts.users).toBe(2);
    expect(counts.bakedGoods).toBe(6);
    expect(counts.iterations).toBe(6);
  });

  it("is idempotent when run twice", async () => {
    const t = convexTest(schema, modules);
    await t.action(api.seed.run, {});
    await t.action(api.seed.run, {});

    const counts = await t.run(async (ctx) => {
      const users = await ctx.db.query("users").collect();
      const bakedGoods = await ctx.db.query("bakedGoods").collect();
      const iterations = await ctx.db.query("recipeIterations").collect();
      return {
        users: users.length,
        bakedGoods: bakedGoods.length,
        iterations: iterations.length,
      };
    });

    expect(counts.users).toBe(2);
    expect(counts.bakedGoods).toBe(6);
    expect(counts.iterations).toBe(6);
  });

  it("all seeded baked goods are public", async () => {
    const t = convexTest(schema, modules);
    await t.action(api.seed.run, {});

    const community = await t.query(api.bakedGoods.listCommunityBakedGoods);
    expect(community).toHaveLength(6);
  });

  it("seeded iterations have recipe content and ratings", async () => {
    const t = convexTest(schema, modules);
    await t.action(api.seed.run, {});

    const iterations = await t.run(async (ctx) => {
      return await ctx.db.query("recipeIterations").collect();
    });

    for (const it of iterations) {
      expect(it.recipeContent.length).toBeGreaterThan(50);
      expect(it.difficulty).toBeTruthy();
      expect(it.totalTime === undefined || it.totalTime > 0).toBe(true);
      expect(it.bakeDate).toBeGreaterThan(0);
    }

    const withRatings = iterations.filter((it) => it.rating != null);
    expect(withRatings.length).toBeGreaterThan(0);
  });
});
