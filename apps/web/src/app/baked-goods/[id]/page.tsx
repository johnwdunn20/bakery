"use client";

import { useQuery } from "convex/react";
import { api } from "@bakery/backend";
import type { Id } from "@bakery/backend/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function BakedGoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const bakedGood = useQuery(
    api.bakedGoods.getBakedGoodWithIterations,
    id ? { id: id as Id<"bakedGoods"> } : "skip"
  );

  if (bakedGood === undefined) {
    return (
      <div className="p-6 md:p-8 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (bakedGood === null) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
        <p className="text-muted-foreground">Baked good not found.</p>
        <Button variant="link" onClick={() => router.push("/my-bakery")}>
          Back to My Bakery
        </Button>
      </div>
    );
  }

  const iterations = bakedGood.iterations ?? [];

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{bakedGood.name}</h1>
        {bakedGood.description && (
          <p className="text-muted-foreground mt-1">{bakedGood.description}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Iterations</CardTitle>
          <CardDescription>
            Recipe iterations track each time you bake this good—ingredients, timing, and notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {iterations.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground mb-4">No iterations yet.</p>
              <Button asChild disabled title="Coming in Phase 2">
                <a href="#">
                  <Plus className="mr-2 h-4 w-4" />
                  Add iteration (coming soon)
                </a>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {iterations.map((it) => (
                <li key={it._id} className="text-sm text-muted-foreground">
                  Iteration placeholder (Phase 2)
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
