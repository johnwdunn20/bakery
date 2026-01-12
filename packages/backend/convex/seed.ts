import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const SEED_RECIPES = [
  {
    name: "Classic Sourdough",
    description: "A crusty, tangy loaf with an open crumb.",
    imageUrl: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "Bread Flour", amount: 450, unit: "g", isFlour: true, isLiquid: false },
      { name: "Whole Wheat Flour", amount: 50, unit: "g", isFlour: true, isLiquid: false },
      { name: "Water", amount: 375, unit: "g", isFlour: false, isLiquid: true },
      { name: "Salt", amount: 10, unit: "g", isFlour: false, isLiquid: false },
      { name: "Sourdough Starter", amount: 100, unit: "g", isFlour: false, isLiquid: false },
    ],
  },
  {
    name: "Pain au Chocolat",
    description: "Buttery, flaky French pastry filled with dark chocolate.",
    imageUrl: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "All-Purpose Flour", amount: 500, unit: "g", isFlour: true, isLiquid: false },
      { name: "Milk", amount: 250, unit: "g", isFlour: false, isLiquid: true },
      { name: "Butter (for lamination)", amount: 250, unit: "g", isFlour: false, isLiquid: false },
      { name: "Sugar", amount: 60, unit: "g", isFlour: false, isLiquid: false },
      { name: "Yeast", amount: 10, unit: "g", isFlour: false, isLiquid: false },
      { name: "Chocolate Batons", amount: 100, unit: "g", isFlour: false, isLiquid: false },
    ],
  },
  {
    name: "Chewy Chocolate Chip Cookies",
    description: "The perfect balance of crispy edges and a soft, chewy center.",
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      { name: "All-Purpose Flour", amount: 280, unit: "g", isFlour: true, isLiquid: false },
      { name: "Butter", amount: 170, unit: "g", isFlour: false, isLiquid: false },
      { name: "Brown Sugar", amount: 200, unit: "g", isFlour: false, isLiquid: false },
      { name: "White Sugar", amount: 100, unit: "g", isFlour: false, isLiquid: false },
      { name: "Chocolate Chips", amount: 200, unit: "g", isFlour: false, isLiquid: false },
      { name: "Egg", amount: 50, unit: "g", isFlour: false, isLiquid: false },
    ],
  },
];

export const run = action({
  args: {},
  handler: async (ctx) => {
    // 1. Get or create system user
    const authorId = await ctx.runMutation(api.users.getOrCreateSystemUser);

    for (const recipeData of SEED_RECIPES) {
      // 2. Fetch image and store in Convex
      const response = await fetch(recipeData.imageUrl);
      const blob = await response.blob();
      const storageId = await ctx.storage.store(blob);

      // 3. Create recipe
      const recipeId = await ctx.runMutation(api.recipes.createRecipe, {
        authorId,
        name: recipeData.name,
        description: recipeData.description,
        isPublished: true,
      });

      // 4. Create initial variant
      const variantId = await ctx.runMutation(api.recipes.createVariant, {
        recipeId,
        name: "Initial Version",
        imageStorageId: storageId,
      });

      // 5. Add ingredients
      for (let i = 0; i < recipeData.ingredients.length; i++) {
        const ingredient = recipeData.ingredients[i];
        await ctx.runMutation(api.recipes.addIngredient, {
          variantId,
          ...ingredient,
          order: i,
        });
      }
    }

    return { success: true };
  },
});
