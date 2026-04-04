import { describe, it, expect } from "vitest";
import { sortIterations } from "./sort-iterations";

const items = [
  { bakeDate: 100, rating: 3 },
  { bakeDate: 300, rating: 5 },
  { bakeDate: 200, rating: 1 },
  { bakeDate: 400, rating: null },
];

describe("sortIterations", () => {
  it("sorts by date descending", () => {
    const result = sortIterations(items, "date-desc");
    expect(result.map((i) => i.bakeDate)).toEqual([400, 300, 200, 100]);
  });

  it("sorts by date ascending", () => {
    const result = sortIterations(items, "date-asc");
    expect(result.map((i) => i.bakeDate)).toEqual([100, 200, 300, 400]);
  });

  it("sorts by rating descending, null ratings sink to the bottom", () => {
    const result = sortIterations(items, "rating-desc");
    expect(result.map((i) => i.rating)).toEqual([5, 3, 1, null]);
  });

  it("sorts by rating ascending, null ratings sink to the bottom", () => {
    const result = sortIterations(items, "rating-asc");
    expect(result.map((i) => i.rating)).toEqual([1, 3, 5, null]);
  });

  it("does not mutate the original array", () => {
    const original = [...items];
    sortIterations(items, "date-asc");
    expect(items).toEqual(original);
  });

  it("handles an empty array", () => {
    expect(sortIterations([], "date-desc")).toEqual([]);
  });
});
