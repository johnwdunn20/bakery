import { describe, it, expect } from "vitest";
import {
  calculateBakersPercentage,
  scaleRecipe,
  SUBSTITUTION_GUIDE,
  type Ingredient,
} from "./index";

describe("calculateBakersPercentage", () => {
  it("returns all percentages as 0 when there is no flour", () => {
    const ingredients: Ingredient[] = [
      { name: "Water", amount: 375, unit: "g", isFlour: false, isLiquid: true },
      { name: "Salt", amount: 10, unit: "g", isFlour: false, isLiquid: false },
    ];
    const result = calculateBakersPercentage(ingredients);
    expect(result.every((i) => i.percentage === 0)).toBe(true);
  });

  it("returns 100% for the only flour ingredient", () => {
    const ingredients: Ingredient[] = [
      { name: "Bread Flour", amount: 500, unit: "g", isFlour: true, isLiquid: false },
    ];
    const result = calculateBakersPercentage(ingredients);
    expect(result[0].percentage).toBe(100);
  });

  it("calculates correct percentages for a standard bread recipe", () => {
    const ingredients: Ingredient[] = [
      { name: "Bread Flour", amount: 500, unit: "g", isFlour: true, isLiquid: false },
      { name: "Water", amount: 375, unit: "g", isFlour: false, isLiquid: true },
      { name: "Salt", amount: 10, unit: "g", isFlour: false, isLiquid: false },
      { name: "Yeast", amount: 5, unit: "g", isFlour: false, isLiquid: false },
    ];
    const result = calculateBakersPercentage(ingredients);

    expect(result[0].percentage).toBe(100);
    expect(result[1].percentage).toBe(75);
    expect(result[2].percentage).toBe(2);
    expect(result[3].percentage).toBe(1);
  });

  it("splits flour percentage across multiple flour ingredients", () => {
    const ingredients: Ingredient[] = [
      { name: "Bread Flour", amount: 400, unit: "g", isFlour: true, isLiquid: false },
      { name: "Rye Flour", amount: 100, unit: "g", isFlour: true, isLiquid: false },
    ];
    const result = calculateBakersPercentage(ingredients);

    expect(result[0].percentage).toBe(80);
    expect(result[1].percentage).toBe(20);
  });

  it("handles an empty ingredient list", () => {
    const result = calculateBakersPercentage([]);
    expect(result).toEqual([]);
  });
});

describe("scaleRecipe", () => {
  const baseIngredients: Ingredient[] = [
    { name: "Flour", amount: 500, unit: "g", isFlour: true, isLiquid: false },
    { name: "Water", amount: 375, unit: "g", isFlour: false, isLiquid: true },
    { name: "Salt", amount: 10, unit: "g", isFlour: false, isLiquid: false },
  ];

  it("returns identical amounts when factor is 1", () => {
    const result = scaleRecipe(baseIngredients, 1);
    expect(result.map((i) => i.amount)).toEqual([500, 375, 10]);
  });

  it("doubles amounts when factor is 2", () => {
    const result = scaleRecipe(baseIngredients, 2);
    expect(result.map((i) => i.amount)).toEqual([1000, 750, 20]);
  });

  it("halves amounts when factor is 0.5", () => {
    const result = scaleRecipe(baseIngredients, 0.5);
    expect(result.map((i) => i.amount)).toEqual([250, 187.5, 5]);
  });

  it("returns zero amounts when factor is 0", () => {
    const result = scaleRecipe(baseIngredients, 0);
    expect(result.every((i) => i.amount === 0)).toBe(true);
  });

  it("handles an empty ingredient list", () => {
    const result = scaleRecipe([], 2);
    expect(result).toEqual([]);
  });

  it("preserves non-amount properties", () => {
    const result = scaleRecipe(baseIngredients, 2);
    expect(result[0].name).toBe("Flour");
    expect(result[0].unit).toBe("g");
    expect(result[0].isFlour).toBe(true);
    expect(result[0].isLiquid).toBe(false);
  });
});

describe("SUBSTITUTION_GUIDE", () => {
  it("contains expected substitutions", () => {
    expect(SUBSTITUTION_GUIDE.length).toBeGreaterThan(0);
    for (const item of SUBSTITUTION_GUIDE) {
      expect(item).toHaveProperty("ingredient");
      expect(item).toHaveProperty("substitute");
      expect(item).toHaveProperty("notes");
    }
  });

  it("includes buttermilk substitution", () => {
    const buttermilk = SUBSTITUTION_GUIDE.find((s) => s.ingredient === "Buttermilk");
    expect(buttermilk).toBeDefined();
    expect(buttermilk!.substitute).toContain("lemon juice");
  });
});
