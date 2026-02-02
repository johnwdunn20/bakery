"use client";

import { SubstitutionSearch } from "@/components/substitution-search";

export default function SubstitutionsPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Ingredient Substitutions</h1>
        <p className="text-muted-foreground max-w-2xl">
          Never let a missing ingredient stop your bake. Search for common substitutions 
          and alternatives.
        </p>
      </div>
      <SubstitutionSearch />
    </div>
  );
}
