"use client";

import { BakersMathCalculator } from "@/components/bakers-math-calculator";

export default function CalculatorPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Baker&apos;s Math</h1>
        <p className="text-muted-foreground max-w-2xl">
          Scale recipes instantly using baker&apos;s percentages. Adjust the flour amount and watch
          all other ingredients scale proportionally.
        </p>
      </div>
      <BakersMathCalculator />
    </div>
  );
}
