"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SUBSTITUTION_GUIDE } from "@bakery/shared";
import { Search } from "lucide-react";

export function SubstitutionSearch() {
  const [query, setQuery] = useState("");

  const filtered = SUBSTITUTION_GUIDE.filter(
    (item) =>
      item.ingredient.toLowerCase().includes(query.toLowerCase()) ||
      item.substitute.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/20 bg-background/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Ingredient Substitution Guide</CardTitle>
        <CardDescription>Never let a missing ingredient stop your bake.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ingredients (e.g. buttermilk, yeast)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.ingredient}
                className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-lg">{item.ingredient}</h4>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-secondary text-secondary-foreground">
                    Substitute
                  </span>
                </div>
                <p className="text-primary font-medium">{item.substitute}</p>
                {item.notes && (
                  <p className="text-sm text-muted-foreground mt-2 italic">Note: {item.notes}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No results found for "{query}". Try searching for something else!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
