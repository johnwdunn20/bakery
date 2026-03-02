import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BakersMathCalculator } from "./bakers-math-calculator";

describe("BakersMathCalculator", () => {
  it("renders the title", () => {
    render(<BakersMathCalculator />);
    expect(screen.getByText("Live Baker's Math Demo")).toBeInTheDocument();
  });

  it("renders default ingredients", () => {
    render(<BakersMathCalculator />);
    expect(screen.getByText("Bread Flour")).toBeInTheDocument();
    expect(screen.getByText("Water")).toBeInTheDocument();
    expect(screen.getByText("Salt")).toBeInTheDocument();
    expect(screen.getByText("Yeast")).toBeInTheDocument();
  });

  it("displays default hydration of 75%", () => {
    render(<BakersMathCalculator />);
    expect(screen.getByText("75% Hydration")).toBeInTheDocument();
  });

  it("displays flour at 100%", () => {
    render(<BakersMathCalculator />);
    expect(screen.getByText("100.0%")).toBeInTheDocument();
  });

  it("updates amounts when flour input changes", async () => {
    const user = userEvent.setup();
    render(<BakersMathCalculator />);

    const input = screen.getByLabelText(/total flour amount/i);
    await user.clear(input);
    await user.type(input, "1000");

    expect(screen.getByText(/750/)).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<BakersMathCalculator />);
    expect(screen.getByText("Ingredient")).toBeInTheDocument();
    expect(screen.getByText("Weight (g)")).toBeInTheDocument();
    expect(screen.getByText("Ratio (%)")).toBeInTheDocument();
  });
});
