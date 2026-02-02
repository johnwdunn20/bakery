"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateBakersPercentage, type Ingredient } from "@bakery/shared";

const DEFAULT_INGREDIENTS: Ingredient[] = [
  { name: "Bread Flour", amount: 500, unit: "g", isFlour: true, isLiquid: false },
  { name: "Water", amount: 375, unit: "g", isFlour: false, isLiquid: true },
  { name: "Salt", amount: 10, unit: "g", isFlour: false, isLiquid: false },
  { name: "Yeast", amount: 5, unit: "g", isFlour: false, isLiquid: false },
];

export function BakersMathCalculator() {
  const [totalFlour, setTotalFlour] = useState(500);

  const calculatedIngredients = useMemo(() => {
    // Original ratios based on 500g flour
    const baseFlour = 500;
    const factor = totalFlour / baseFlour;

    const scaled = DEFAULT_INGREDIENTS.map((ing) => ({
      ...ing,
      amount: Math.round(ing.amount * factor * 10) / 10,
    }));

    return calculateBakersPercentage(scaled);
  }, [totalFlour]);

  const hydration = useMemo(() => {
    const totalLiquid = calculatedIngredients
      .filter((i) => i.isLiquid)
      .reduce((sum, i) => sum + i.amount, 0);
    const flourAmount = calculatedIngredients
      .filter((i) => i.isFlour)
      .reduce((sum, i) => sum + i.amount, 0);
    return flourAmount > 0 ? Math.round((totalLiquid / flourAmount) * 100) : 0;
  }, [calculatedIngredients]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/20 bg-background/50 backdrop-blur">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">Live Baker's Math Demo</CardTitle>
            <CardDescription>Adjust the flour and watch the recipe scale.</CardDescription>
          </div>
          <div className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <span className="text-sm font-semibold text-primary">{hydration}% Hydration</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="flour-input" className="text-lg font-medium">
            Total Flour Amount (g)
          </Label>
          <Input
            id="flour-input"
            type="number"
            value={totalFlour}
            onChange={(e) => setTotalFlour(Number(e.target.value))}
            className="text-xl h-12"
          />
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-semibold">Ingredient</th>
                <th className="p-4 font-semibold">Weight (g)</th>
                <th className="p-4 font-semibold text-right">Ratio (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {calculatedIngredients.map((ing) => (
                <tr key={ing.name} className={ing.isFlour ? "bg-primary/5" : ""}>
                  <td className="p-4 font-medium">{ing.name}</td>
                  <td className="p-4">
                    {ing.amount}
                    {ing.unit}
                  </td>
                  <td className="p-4 text-right text-muted-foreground font-mono">
                    {ing.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-center text-muted-foreground italic">
          Try changing the flour to see how professional bakers scale their bakes.
        </p>
      </CardContent>
    </Card>
  );
}
