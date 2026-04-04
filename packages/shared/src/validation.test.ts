import { describe, it, expect } from "vitest";
import {
  emailSchema,
  paginationSchema,
  bakedGoodSchema,
  iterationSchema,
  DIFFICULTIES,
} from "./validation";

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    expect(emailSchema.parse("baker@example.com")).toBe("baker@example.com");
  });

  it("rejects an invalid email", () => {
    expect(() => emailSchema.parse("not-an-email")).toThrow();
  });

  it("rejects an empty string", () => {
    expect(() => emailSchema.parse("")).toThrow();
  });
});

describe("paginationSchema", () => {
  it("applies defaults when no values are provided", () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("accepts valid page and limit", () => {
    const result = paginationSchema.parse({ page: 3, limit: 50 });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });

  it("rejects limit above 100", () => {
    expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
  });

  it("rejects negative page", () => {
    expect(() => paginationSchema.parse({ page: -1 })).toThrow();
  });

  it("rejects zero page", () => {
    expect(() => paginationSchema.parse({ page: 0 })).toThrow();
  });

  it("rejects non-integer page", () => {
    expect(() => paginationSchema.parse({ page: 1.5 })).toThrow();
  });
});

describe("DIFFICULTIES", () => {
  it("contains the expected difficulty levels", () => {
    expect(DIFFICULTIES).toEqual(["Easy", "Medium", "Hard"]);
  });
});

describe("bakedGoodSchema", () => {
  it("accepts a valid baked good with name only", () => {
    const result = bakedGoodSchema.parse({ name: "Sourdough" });
    expect(result.name).toBe("Sourdough");
    expect(result.description).toBeUndefined();
  });

  it("accepts a valid baked good with name and description", () => {
    const result = bakedGoodSchema.parse({
      name: "Sourdough",
      description: "A classic loaf",
    });
    expect(result.description).toBe("A classic loaf");
  });

  it("rejects an empty name", () => {
    expect(() => bakedGoodSchema.parse({ name: "" })).toThrow();
  });

  it("rejects a name exceeding 100 characters", () => {
    expect(() => bakedGoodSchema.parse({ name: "a".repeat(101) })).toThrow();
  });

  it("rejects a description exceeding 500 characters", () => {
    expect(() => bakedGoodSchema.parse({ name: "Bread", description: "d".repeat(501) })).toThrow();
  });
});

describe("iterationSchema", () => {
  const validIteration = {
    recipeContent: "Mix flour and water. Knead for 10 minutes.",
    difficulty: "Medium" as const,
    totalTime: 120,
    bakeDate: "2025-06-15",
  };

  it("accepts a valid iteration with required fields only", () => {
    const result = iterationSchema.parse(validIteration);
    expect(result.recipeContent).toBe(validIteration.recipeContent);
    expect(result.difficulty).toBe("Medium");
    expect(result.totalTime).toBe(120);
    expect(result.bakeDate).toBe("2025-06-15");
  });

  it("accepts a full iteration with all optional fields", () => {
    const result = iterationSchema.parse({
      ...validIteration,
      rating: 4,
      notes: "Great crumb structure",
      sourceUrl: "https://example.com/recipe",
    });
    expect(result.rating).toBe(4);
    expect(result.notes).toBe("Great crumb structure");
    expect(result.sourceUrl).toBe("https://example.com/recipe");
  });

  it("rejects empty recipe content", () => {
    expect(() => iterationSchema.parse({ ...validIteration, recipeContent: "" })).toThrow();
  });

  it("rejects an invalid difficulty", () => {
    expect(() => iterationSchema.parse({ ...validIteration, difficulty: "Expert" })).toThrow();
  });

  it("accepts omitting totalTime", () => {
    const { totalTime: _, ...withoutTime } = validIteration;
    const result = iterationSchema.parse(withoutTime);
    expect(result.totalTime).toBeUndefined();
  });

  it("rejects totalTime less than 1", () => {
    expect(() => iterationSchema.parse({ ...validIteration, totalTime: 0 })).toThrow();
  });

  it("coerces totalTime from string to number", () => {
    const result = iterationSchema.parse({ ...validIteration, totalTime: "45" });
    expect(result.totalTime).toBe(45);
  });

  it("rejects an invalid date format", () => {
    expect(() => iterationSchema.parse({ ...validIteration, bakeDate: "15/06/2025" })).toThrow();
  });

  it("rejects an invalid URL in sourceUrl", () => {
    expect(() => iterationSchema.parse({ ...validIteration, sourceUrl: "not a url" })).toThrow();
  });

  it("accepts an empty string for sourceUrl", () => {
    const result = iterationSchema.parse({ ...validIteration, sourceUrl: "" });
    expect(result.sourceUrl).toBe("");
  });

  it("rejects rating below 1", () => {
    expect(() => iterationSchema.parse({ ...validIteration, rating: 0 })).toThrow();
  });

  it("rejects rating above 5", () => {
    expect(() => iterationSchema.parse({ ...validIteration, rating: 6 })).toThrow();
  });
});
