"use client";

import { SubstitutionSearch } from "@/components/substitution-search";

export default function SubstitutionsPage() {
  return (
    <section className="py-12 md:py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Ingredient Substitutions</h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Never let a missing ingredient stop your bake. Search for common substitutions 
            and alternatives.
          </p>
        </div>
        <SubstitutionSearch />
      </div>
    </section>
  );
}
