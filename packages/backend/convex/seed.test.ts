import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

describe("seed.run", () => {
  it("creates seed users and baked goods", async () => {
    const t = convexTest(schema, modules);
    const result = await t.action(api.seed.run, {});
    expect(result).toEqual({ success: true });

    const counts = await t.run(async (ctx) => {
      const users = await ctx.db.query("users").collect();
      const bakedGoods = await ctx.db.query("bakedGoods").collect();
      return { users: users.length, bakedGoods: bakedGoods.length };
    });

    expect(counts.users).toBe(2);
    expect(counts.bakedGoods).toBe(6);
  });

  it("is idempotent when run twice", async () => {
    const t = convexTest(schema, modules);
    await t.action(api.seed.run, {});
    await t.action(api.seed.run, {});

    const counts = await t.run(async (ctx) => {
      const users = await ctx.db.query("users").collect();
      const bakedGoods = await ctx.db.query("bakedGoods").collect();
      return { users: users.length, bakedGoods: bakedGoods.length };
    });

    expect(counts.users).toBe(2);
    expect(counts.bakedGoods).toBe(12);
  });
});
