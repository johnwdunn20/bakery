import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubstitutionSearch } from "./substitution-search";

describe("SubstitutionSearch", () => {
  it("renders all substitutions by default", () => {
    render(<SubstitutionSearch />);
    expect(screen.getByText("Buttermilk")).toBeInTheDocument();
    expect(screen.getByText("Active Dry Yeast")).toBeInTheDocument();
    expect(screen.getByText("Cake Flour")).toBeInTheDocument();
  });

  it("renders the title and description", () => {
    render(<SubstitutionSearch />);
    expect(screen.getByText("Ingredient Substitution Guide")).toBeInTheDocument();
    expect(screen.getByText("Never let a missing ingredient stop your bake.")).toBeInTheDocument();
  });

  it("filters results based on search input", async () => {
    const user = userEvent.setup();
    render(<SubstitutionSearch />);

    const input = screen.getByPlaceholderText(/search ingredients/i);
    await user.type(input, "butter");

    expect(screen.getByText("Buttermilk")).toBeInTheDocument();
    expect(screen.queryByText("Active Dry Yeast")).not.toBeInTheDocument();
  });

  it("shows no results message when search has no matches", async () => {
    const user = userEvent.setup();
    render(<SubstitutionSearch />);

    const input = screen.getByPlaceholderText(/search ingredients/i);
    await user.type(input, "xyznonexistent");

    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });

  it("searches by substitute text too", async () => {
    const user = userEvent.setup();
    render(<SubstitutionSearch />);

    const input = screen.getByPlaceholderText(/search ingredients/i);
    await user.type(input, "lemon juice");

    expect(screen.getByText("Buttermilk")).toBeInTheDocument();
  });

  it("is case-insensitive", async () => {
    const user = userEvent.setup();
    render(<SubstitutionSearch />);

    const input = screen.getByPlaceholderText(/search ingredients/i);
    await user.type(input, "YEAST");

    expect(screen.getByText("Active Dry Yeast")).toBeInTheDocument();
  });
});
