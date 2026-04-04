import { describe, it, expect } from "vitest";
import { formatDate, formatMinutes, formatDateForInput } from "./format";

describe("formatMinutes", () => {
  it("shows minutes only when under 60", () => {
    expect(formatMinutes(30)).toBe("30 min");
    expect(formatMinutes(1)).toBe("1 min");
    expect(formatMinutes(59)).toBe("59 min");
  });

  it("shows hours only when evenly divisible by 60", () => {
    expect(formatMinutes(60)).toBe("1h");
    expect(formatMinutes(120)).toBe("2h");
  });

  it("shows hours and remaining minutes", () => {
    expect(formatMinutes(90)).toBe("1h 30min");
    expect(formatMinutes(150)).toBe("2h 30min");
    expect(formatMinutes(61)).toBe("1h 1min");
  });

  it("handles zero", () => {
    expect(formatMinutes(0)).toBe("0 min");
  });
});

describe("formatDateForInput", () => {
  it("returns YYYY-MM-DD format", () => {
    const ts = new Date(2025, 2, 15, 12).getTime();
    expect(formatDateForInput(ts)).toBe("2025-03-15");
  });

  it("zero-pads single-digit months and days", () => {
    const ts = new Date(2025, 0, 5, 12).getTime();
    expect(formatDateForInput(ts)).toBe("2025-01-05");
  });
});

describe("formatDate", () => {
  it("returns a human-readable date string containing the year", () => {
    const ts = new Date(2025, 5, 20).getTime();
    const result = formatDate(ts);
    expect(result).toContain("2025");
    expect(result).toContain("20");
  });

  it("returns different strings for different dates", () => {
    const a = formatDate(new Date(2025, 0, 1).getTime());
    const b = formatDate(new Date(2025, 11, 31).getTime());
    expect(a).not.toBe(b);
  });
});
