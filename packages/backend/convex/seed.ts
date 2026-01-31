import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const SEED_USERS = [
  { clerkId: "seed_alex", email: "alex@seed.bakery", username: "seed_alex", name: "Alex Baker" },
  { clerkId: "seed_sam", email: "sam@seed.bakery", username: "seed_sam", name: "Sam Cook" },
];

const SEED_BAKED_GOODS: { name: string; description?: string; authorIndex: number }[] = [
  { name: "Classic Sourdough", description: "A crusty, tangy loaf with an open crumb.", authorIndex: 0 },
  { name: "Pain au Chocolat", description: "Buttery, flaky French pastry filled with dark chocolate.", authorIndex: 0 },
  { name: "Chewy Chocolate Chip Cookies", description: "The perfect balance of crispy edges and a soft, chewy center.", authorIndex: 1 },
  { name: "Banana Bread", description: "Moist and warmly spiced quick bread.", authorIndex: 1 },
  { name: "Croissants", description: "Layered, buttery laminated pastry.", authorIndex: 0 },
  { name: "Cinnamon Rolls", description: "Soft buns with cinnamon swirl and cream cheese frosting.", authorIndex: 1 },
];

export const run = action({
  args: {},
  handler: async (ctx) => {
    const userIds: Id<"users">[] = [];

    for (const userData of SEED_USERS) {
      const userId = await ctx.runMutation(internal.users.getOrCreateSeedUser, {
        clerkId: userData.clerkId,
        email: userData.email,
        username: userData.username,
        name: userData.name,
      });
      userIds.push(userId);
    }

    for (const bg of SEED_BAKED_GOODS) {
      const authorId = userIds[bg.authorIndex]!;
      await ctx.runMutation(internal.bakedGoods.createBakedGoodForSeed, {
        authorId,
        name: bg.name,
        description: bg.description,
      });
    }

    return { success: true };
  },
});
