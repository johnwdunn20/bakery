export const SUBSTITUTION_GUIDE = [
  {
    ingredient: "Buttermilk",
    substitute: "1 cup milk + 1 tbsp lemon juice or white vinegar",
    notes: "Let sit for 5-10 minutes until slightly curdled.",
  },
  {
    ingredient: "Active Dry Yeast",
    substitute: "Instant Yeast (use 25% less)",
    notes: "No need to bloom instant yeast in water first.",
  },
  {
    ingredient: "Cake Flour",
    substitute: "1 cup all-purpose flour minus 2 tbsp + 2 tbsp cornstarch",
    notes: "Sift together multiple times for best results.",
  },
  {
    ingredient: "Egg (for binding)",
    substitute: "1/4 cup applesauce or 1 tbsp flaxseed meal + 3 tbsp water",
    notes: "Works best in muffins or quick breads.",
  },
  {
    ingredient: "Baking Powder",
    substitute: "1/4 tsp baking soda + 1/2 tsp cream of tartar",
    notes: "Use immediately as the reaction starts right away.",
  },
];

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  isFlour: boolean;
  isLiquid: boolean;
}

export function calculateBakersPercentage(ingredients: Ingredient[]) {
  const totalFlour = ingredients
    .filter((i) => i.isFlour)
    .reduce((sum, i) => sum + i.amount, 0);

  if (totalFlour === 0) return ingredients.map((i) => ({ ...i, percentage: 0 }));

  return ingredients.map((i) => ({
    ...i,
    percentage: (i.amount / totalFlour) * 100,
  }));
}

export function scaleRecipe(ingredients: Ingredient[], factor: number) {
  return ingredients.map((i) => ({
    ...i,
    amount: i.amount * factor,
  }));
}
