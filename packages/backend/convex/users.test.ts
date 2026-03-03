import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

describe("users.getCurrentUser", () => {
  it("returns null when not authenticated", async () => {
    const t = convexTest(schema, modules);
    const user = await t.query(api.users.getCurrentUser);
    expect(user).toBeNull();
  });

  it("returns null when authenticated but user not in database", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({ subject: "clerk_123", nickname: "testuser" });
    const user = await asUser.query(api.users.getCurrentUser);
    expect(user).toBeNull();
  });

  it("returns the user when authenticated and user exists", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      await ctx.db.insert("users", {
        clerkId: "clerk_123",
        email: "test@example.com",
        username: "testuser",
        name: "Test User",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    const asUser = t.withIdentity({ subject: "clerk_123", nickname: "testuser" });
    const user = await asUser.query(api.users.getCurrentUser);
    expect(user).not.toBeNull();
    expect(user!.email).toBe("test@example.com");
    expect(user!.username).toBe("testuser");
  });
});

describe("users.syncUser", () => {
  it("throws when not authenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(api.users.syncUser, {})).rejects.toThrow("Not authenticated");
  });

  it("creates a new user when syncing for the first time", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({
      subject: "clerk_new",
      email: "new@example.com",
      nickname: "newuser",
      name: "New User",
    });

    const userId = await asUser.mutation(api.users.syncUser, {});
    expect(userId).toBeDefined();

    const user = await asUser.query(api.users.getCurrentUser);
    expect(user).not.toBeNull();
    expect(user!.username).toBe("newuser");
    expect(user!.email).toBe("new@example.com");
  });

  it("returns existing user id when syncing an existing user with no changes", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({
      subject: "clerk_existing",
      email: "existing@example.com",
      nickname: "existinguser",
      name: "Existing User",
    });

    const firstId = await asUser.mutation(api.users.syncUser, {});
    const secondId = await asUser.mutation(api.users.syncUser, {});
    expect(firstId).toEqual(secondId);
  });

  it("throws when username is missing from identity", async () => {
    const t = convexTest(schema, modules);
    const asUser = t.withIdentity({
      subject: "clerk_nousername",
      email: "no-username@example.com",
    });
    await expect(asUser.mutation(api.users.syncUser, {})).rejects.toThrow("Username is required");
  });

  it("throws when email is already taken by another user", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      await ctx.db.insert("users", {
        clerkId: "clerk_other",
        email: "taken@example.com",
        username: "otheruser",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    const asUser = t.withIdentity({
      subject: "clerk_new",
      email: "taken@example.com",
      nickname: "newuser2",
    });
    await expect(asUser.mutation(api.users.syncUser, {})).rejects.toThrow(
      "Email is already in use"
    );
  });

  it("throws when username is already taken by another user", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      await ctx.db.insert("users", {
        clerkId: "clerk_other",
        email: "other@example.com",
        username: "takenname",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    const asUser = t.withIdentity({
      subject: "clerk_new",
      email: "new@example.com",
      nickname: "takenname",
    });
    await expect(asUser.mutation(api.users.syncUser, {})).rejects.toThrow(
      "Username is already taken"
    );
  });
});

describe("users.getOrCreateSeedUser", () => {
  it("creates a new seed user", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.mutation(internal.users.getOrCreateSeedUser, {
      clerkId: "seed_test",
      email: "seed@test.com",
      username: "seeduser",
      name: "Seed User",
    });
    expect(userId).toBeDefined();
  });

  it("returns existing user on duplicate username", async () => {
    const t = convexTest(schema, modules);
    const first = await t.mutation(internal.users.getOrCreateSeedUser, {
      clerkId: "seed_test",
      email: "seed@test.com",
      username: "seeduser",
      name: "Seed User",
    });
    const second = await t.mutation(internal.users.getOrCreateSeedUser, {
      clerkId: "seed_test_2",
      email: "seed2@test.com",
      username: "seeduser",
      name: "Seed User 2",
    });
    expect(first).toEqual(second);
  });
});

describe("users.getOrCreateSystemUser", () => {
  it("creates a system user", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.mutation(internal.users.getOrCreateSystemUser, {});
    expect(userId).toBeDefined();
  });

  it("is idempotent", async () => {
    const t = convexTest(schema, modules);
    const first = await t.mutation(internal.users.getOrCreateSystemUser, {});
    const second = await t.mutation(internal.users.getOrCreateSystemUser, {});
    expect(first).toEqual(second);
  });
});
