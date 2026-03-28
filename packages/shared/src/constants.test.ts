import { describe, it, expect } from "vitest";
import { APP_NAME, TIME_PRESETS } from "./constants";

describe("constants", () => {
  it("APP_NAME matches expected value", () => {
    expect(APP_NAME).toBe("Bakery");
  });

  it("TIME_PRESETS contains the expected minute values in ascending order", () => {
    expect(TIME_PRESETS).toEqual([30, 60, 90, 120, 180, 240]);
    for (let i = 1; i < TIME_PRESETS.length; i++) {
      expect(TIME_PRESETS[i]).toBeGreaterThan(TIME_PRESETS[i - 1]);
    }
  });
});
