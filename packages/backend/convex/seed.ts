import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const SEED_USERS = [
  { clerkId: "seed_alex", email: "alex@seed.bakery", username: "seed_alex", name: "Alex Baker" },
  { clerkId: "seed_sam", email: "sam@seed.bakery", username: "seed_sam", name: "Sam Cook" },
];

const SEED_BAKED_GOODS: {
  name: string;
  description?: string;
  authorIndex: number;
  iteration: {
    recipeContent: string;
    difficulty: "Easy" | "Medium" | "Hard";
    totalTime: number;
    bakeDate: number;
    rating?: number;
    notes?: string;
  };
}[] = [
  {
    name: "Classic Sourdough",
    description: "A crusty, tangy loaf with an open crumb.",
    authorIndex: 0,
    iteration: {
      recipeContent: `## Ingredients

- 500g bread flour
- 350g water (70% hydration)
- 100g active starter
- 10g salt

## Instructions

1. Mix flour and water, rest 30 min (autolyse)
2. Add starter and salt, fold to incorporate
3. Bulk ferment 4-5 hours with stretch & folds every 30 min for first 2 hours
4. Pre-shape, bench rest 20 min, then final shape
5. Cold retard in fridge 12-16 hours
6. Preheat Dutch oven at 500°F (260°C)
7. Score and bake covered 20 min, uncovered 20-25 min at 450°F (230°C)`,
      difficulty: "Hard",
      totalTime: 1440,
      bakeDate: new Date("2026-03-15").getTime(),
      rating: 5,
      notes: "Beautiful ear and open crumb. The long cold retard really develops the flavor.",
    },
  },
  {
    name: "Pain au Chocolat",
    description: "Buttery, flaky French pastry filled with dark chocolate.",
    authorIndex: 0,
    iteration: {
      recipeContent: `## Ingredients

### Détrempe
- 500g all-purpose flour
- 80g sugar
- 10g salt
- 10g instant yeast
- 300ml whole milk
- 1 egg

### Lamination
- 280g cold unsalted butter (block)

### Filling
- 200g dark chocolate batons (or chopped 70% chocolate)

## Instructions

1. Make détrempe: combine dry ingredients, add milk and egg, knead 5 min
2. Wrap and chill 1 hour
3. Pound butter into flat square, enclose in dough
4. Roll out and do 3 single folds with 30 min rests between each
5. Roll to 5mm thick, cut into rectangles (about 8×12 cm)
6. Place chocolate batons, roll up tightly
7. Proof 2 hours at room temperature until puffy
8. Egg wash and bake at 400°F (200°C) for 15-18 min`,
      difficulty: "Hard",
      totalTime: 480,
      bakeDate: new Date("2026-03-10").getTime(),
      rating: 4,
      notes:
        "Lamination was tricky but layers turned out well. Next time chill dough longer between folds.",
    },
  },
  {
    name: "Chewy Chocolate Chip Cookies",
    description: "The perfect balance of crispy edges and a soft, chewy center.",
    authorIndex: 1,
    iteration: {
      recipeContent: `## Ingredients

- 225g butter, browned and cooled
- 200g brown sugar
- 100g granulated sugar
- 2 large eggs
- 2 tsp vanilla extract
- 340g all-purpose flour
- 1 tsp baking soda
- 1 tsp salt
- 300g chocolate chips (mix of milk and dark)
- Flaky sea salt for topping

## Instructions

1. Brown the butter in a saucepan, cool to room temperature
2. Whisk browned butter with both sugars until smooth
3. Beat in eggs one at a time, then vanilla
4. Fold in flour, baking soda, and salt until just combined
5. Fold in chocolate chips
6. Chill dough at least 24 hours (up to 72 for deeper flavor)
7. Scoop into 60g balls, bake at 375°F (190°C) for 10-12 min
8. Sprinkle with flaky salt immediately after baking`,
      difficulty: "Easy",
      totalTime: 1470,
      bakeDate: new Date("2026-03-20").getTime(),
      rating: 5,
      notes: "The 48-hour rest made a huge difference. Browned butter is non-negotiable.",
    },
  },
  {
    name: "Banana Bread",
    description: "Moist and warmly spiced quick bread.",
    authorIndex: 1,
    iteration: {
      recipeContent: `## Ingredients

- 3 very ripe bananas, mashed
- 75g melted butter
- 150g sugar
- 1 egg
- 1 tsp vanilla extract
- 1 tsp baking soda
- Pinch of salt
- 1 tsp cinnamon
- 190g all-purpose flour
- 60g chopped walnuts (optional)

## Instructions

1. Preheat oven to 350°F (175°C), grease a 9×5 loaf pan
2. Mash bananas with a fork until smooth
3. Mix in melted butter, sugar, egg, and vanilla
4. Stir in baking soda, salt, and cinnamon
5. Fold in flour until just combined — do not overmix
6. Add walnuts if desired
7. Pour into prepared pan, bake 55-65 min
8. Cool in pan 10 min, then turn out onto a rack`,
      difficulty: "Easy",
      totalTime: 80,
      bakeDate: new Date("2026-03-18").getTime(),
      rating: 4,
      notes:
        "Used bananas that were almost black — so much natural sweetness. Could reduce sugar next time.",
    },
  },
  {
    name: "Croissants",
    description: "Layered, buttery laminated pastry.",
    authorIndex: 0,
    iteration: {
      recipeContent: `## Ingredients

- 500g bread flour
- 60g sugar
- 10g salt
- 10g instant yeast
- 280ml whole milk
- 280g cold unsalted European-style butter

## Instructions

1. Mix flour, sugar, salt, yeast, and milk into a smooth dough (5 min)
2. Wrap tightly and refrigerate overnight
3. Pound butter into a flat 15cm square
4. Enclose butter in dough, roll out to 3x length
5. Perform a double fold, rest 1 hour in fridge
6. Perform a single fold, rest 1 hour in fridge
7. Roll to 5mm thickness, cut triangles (base 10cm, height 25cm)
8. Shape croissants, rolling from base to tip
9. Proof at room temperature 2 hours until jiggly
10. Egg wash and bake at 400°F (200°C) for 15-18 min until deep golden`,
      difficulty: "Hard",
      totalTime: 1200,
      bakeDate: new Date("2026-03-05").getTime(),
      rating: 4,
      notes:
        "27 visible layers! The double + single fold method works better for my kitchen temperature.",
    },
  },
  {
    name: "Cinnamon Rolls",
    description: "Soft buns with cinnamon swirl and cream cheese frosting.",
    authorIndex: 1,
    iteration: {
      recipeContent: `## Ingredients

### Dough
- 480g all-purpose flour
- 60g sugar
- 7g instant yeast
- 5g salt
- 180ml warm milk
- 60g butter, softened
- 2 eggs

### Filling
- 100g brown sugar
- 2 tbsp ground cinnamon
- 60g softened butter

### Frosting
- 120g cream cheese, softened
- 60g butter, softened
- 200g powdered sugar
- 1 tsp vanilla extract

## Instructions

1. Combine dough ingredients, knead until smooth and elastic (8-10 min)
2. Rise 1 hour until doubled
3. Roll dough into a 40×30cm rectangle
4. Spread softened butter, sprinkle brown sugar and cinnamon evenly
5. Roll tightly from the long side, cut into 12 pieces
6. Place in a greased 9×13 pan, proof 30 min
7. Bake at 350°F (175°C) for 22-25 min
8. While warm, spread cream cheese frosting generously`,
      difficulty: "Medium",
      totalTime: 180,
      bakeDate: new Date("2026-03-22").getTime(),
      rating: 5,
      notes:
        "Best batch yet. The cream cheese frosting really makes these. Don't skip the second proof.",
    },
  },
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
      const bakedGoodId = await ctx.runMutation(internal.bakedGoods.createBakedGoodForSeed, {
        authorId,
        name: bg.name,
        description: bg.description,
        isPublic: true,
      });

      await ctx.runMutation(internal.bakedGoods.createIterationForSeed, {
        bakedGoodId,
        recipeContent: bg.iteration.recipeContent,
        difficulty: bg.iteration.difficulty,
        totalTime: bg.iteration.totalTime,
        bakeDate: bg.iteration.bakeDate,
        rating: bg.iteration.rating,
        notes: bg.iteration.notes,
      });
    }

    return { success: true };
  },
});
