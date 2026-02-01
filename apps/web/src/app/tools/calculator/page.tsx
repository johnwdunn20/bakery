"use client";

import { BakersMathCalculator } from "@/components/bakers-math-calculator";

export default function CalculatorPage() {
  return (
    <section className="py-12 md:py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Baker&apos;s Math</h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Scale recipes instantly using baker&apos;s percentages. Adjust the flour amount and watch 
            all other ingredients scale proportionally.
          </p>
        </div>
        <BakersMathCalculator />
      </div>
    </section>
  );
}
